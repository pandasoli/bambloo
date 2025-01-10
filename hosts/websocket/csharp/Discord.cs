using System;
using System.Linq;
using System.Runtime.InteropServices;
using System.Net.Sockets;
using System.Collections.Generic;
using System.IO;
using System.IO.Pipes;
using System.Threading;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using System.Security.Principal;
using System.Diagnostics;


public record ActivityTimestamps(
	[property: JsonPropertyName("start")] long? Start,
	[property: JsonPropertyName("end")] long? End
);

public record ActivityAssets(
	[property: JsonPropertyName("large_image")] string? LargeImage,
	[property: JsonPropertyName("large_text")] string? LargeText,
	[property: JsonPropertyName("small_image")] string? SmallImage,
	[property: JsonPropertyName("small_text")] string? SmallText
);

public record ActivityButton(
	[property: JsonPropertyName("label")] string Label,
	[property: JsonPropertyName("url")] string Url
);

public record Activity(
	[property: JsonPropertyName("state")] string State,
	[property: JsonPropertyName("details")] string Details,
	[property: JsonPropertyName("timestamps")] ActivityTimestamps? Timestamps,
	[property: JsonPropertyName("assets")] ActivityAssets Assets,
	[property: JsonPropertyName("buttons")] ActivityButton[]? Buttons
);

public record ResponseActivityMetadata(
	[property: JsonPropertyName("button_urls")] string[] ButtonURLs
);

public record ResponseActivity(
	[property: JsonPropertyName("state")] string State,
	[property: JsonPropertyName("details")] string Details,
	[property: JsonPropertyName("timestamps")] ActivityTimestamps? Timestamps,
	[property: JsonPropertyName("assets")] ActivityAssets Assets,
	[property: JsonPropertyName("buttons")] string[] Buttons,
	[property: JsonPropertyName("name")] string Name,
	[property: JsonPropertyName("application_id")] string ApplicationId,
	[property: JsonPropertyName("type")] int type,
	[property: JsonPropertyName("metadata")] ResponseActivityMetadata Metadata
);

public record Error(int code, string message);

public record SetActivityResponse<T>(
	string? cmd,
	T data,
	string? evt,
	string? nonce
);

public record AuthorizationResponseDataConfig(
	string cdn_host,
	string api_endpoint,
	string environment
);

public record AuthorizationResponseDataUser(
	string id,
	string username,
	string discriminator,
	string global_name,
	string avatar,
	string? avatar_decoration_data,
	bool bot,
	int flags,
	int premium_type
);

public record AuthorizationResponseData(
	int v,
	AuthorizationResponseDataConfig config,
	AuthorizationResponseDataUser user
);

public record AuthorizationResponse(
	string cmd,
	AuthorizationResponseData data,
	string evt,
	string? nonce
);


public class Discord {
	StreamString? buf = null;
	NamedPipeClientStream? pipe = null;
	Socket? socket = null;
	string os = "Unsupported";

	public Discord() {
		if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
			os = "Windows";
		else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
			os = "Linux";
		else
			Console.WriteLine("Unsupported OS");
	}

	public (bool connected, string[] errors) Connect() {
		if (os == "Unsupported") return (false, new string[] {"Unsupported OS"});

		string[] sockets = this.GetSockets();
		var errors = new string[sockets.Length > 0 ? sockets.Length : 1];

		if (sockets.Length == 0)
			errors[0] = "No sockets running";

		for (int i = 0; i < sockets.Length; ++i)
			switch (this.os) {
				case "Windows": {
					this.pipe = new NamedPipeClientStream(
						".", sockets[i],
						PipeDirection.InOut,
						PipeOptions.None,
						TokenImpersonationLevel.Impersonation
					);

					try { this.pipe.Connect(); }
					catch (Exception e) { errors[i] = e.Message; continue; }

					this.buf = new StreamString(this.pipe);
					return (true, errors);
				}

				case "Linux": {
					this.socket = new Socket(AddressFamily.Unix, SocketType.Stream, ProtocolType.Unspecified);
					var endPoint = new UnixDomainSocketEndPoint(sockets[i]);

					try { this.socket.Connect(endPoint); }
					catch (SocketException e) { errors[i] = e.Message; continue; }
					catch (Exception e) { errors[i] = e.Message; continue; }

					this.buf = new StreamString(this.socket);
					return (true, errors);
				}
			}

		return (false, errors);
	}

	string[] GetSockets() {
		string filename, args;

		switch (this.os) {
			case "Windows":
				filename = "powershell";
				args = @"-Command (Get-ChildItem \\.\pipe\).Name | findstr discord";
				break;

			case "Linux":
				filename = "/bin/sh";
				args = "-c \"ss -lx | grep -o '[^[:space:]]*discord[^[:space:]]*'\"";
				break;

			default:
				return new string[] {};
		}

		var startInfo = new ProcessStartInfo() {
			FileName = filename,
			Arguments = args,
			RedirectStandardOutput = true,
			RedirectStandardError = true,
			UseShellExecute = false,
			CreateNoWindow = true
		};

		using (Process process = Process.Start(startInfo)!) {
			string stdout = process!.StandardOutput.ReadToEnd();
			// string stderr = process!.StandardError.ReadToEnd();

			return stdout
				.Split("\n")
				.Select(line => line.Trim())
				.Where(line => line.Length > 0)
				.ToArray();
		}
	}

	public (bool success, string? msg, object? res) Authorize() {
		if (os == "Unsupported") return (false, "Unsupported OS", null);

		var payload = new {
			client_id = "1059272441194623126",
			v = 1
		};

		var msg = Call(0, payload);
		var err = JsonSerializer.Deserialize<Error>(msg);

		if (err?.code > 0)
			return (false, err.message, null);

		var res = JsonSerializer.Deserialize<AuthorizationResponse>(msg);
		return (true, null, res);
	}

	public (bool success, string? msg, object? res) ClearActivity() {
		if (os == "Unsupported") return (false, "Unsupported OS", null);

		return this.SetActivity(null);
	}

	public (bool success, string? msg, object? res) SetActivity(Activity? activity) {
		if (os == "Unsupported") return (false, "Unsupported OS", null);

		var process = Process.GetCurrentProcess();

		var payload = new {
			cmd = "SET_ACTIVITY",
			nonce = Guid.NewGuid().ToString(),
			args = new {
				activity,
				pid = process.Id
			}
		};

		var msg = Call(1, payload);
		var err = JsonSerializer.Deserialize<Error>(msg);

		if (err?.code > 0)
			return (false, err.message, null);

		var data = JsonSerializer.Deserialize<SetActivityResponse<Error>>(msg);

		if (data?.evt == "ERROR")
			return (false, data?.data.message, null);

		var res = JsonSerializer.Deserialize<SetActivityResponse<ResponseActivity>>(msg);
		return (true, msg, res);
	}

	string Call(int opcode, object payload) {
		var options = new JsonSerializerOptions {
			DefaultIgnoreCondition = System.Text.Json.Serialization.JsonIgnoreCondition.WhenWritingNull,

			// Discord requires indentation, otherwise:
			//     Unterminated string in JSON at position x (line 1 column x)
			WriteIndented = true
		};

		string packed_payload = JsonSerializer.Serialize(payload, options);
		byte[] packed_opcode = BitConverter.GetBytes(opcode);
		byte[] packed_size = BitConverter.GetBytes(packed_payload.Length);

		string data = string.Concat(
			Encoding.ASCII.GetString(packed_opcode),
			Encoding.ASCII.GetString(packed_size),
			packed_payload
		);
		this.buf!.WriteString(data);

		byte[] res = this.buf.ReadBytes();
		return Encoding.ASCII.GetString(res);
	}
}

class Printing {
	static void PrintByteArray(string byteArray) {
		foreach (char b in byteArray)
				if (Printing.IsPrintable(b)) Console.Write($"{b} ");
				else Console.Write($"{(int) b:X2} ");
		Console.WriteLine();
	}

	static void PrintByteArray(byte[] byteArray) {
		foreach (byte b in byteArray)
				if (Printing.IsPrintable(b)) Console.Write($"{(char) b} ");
				else Console.Write($"{b:X2} ");
		Console.WriteLine();
	}

	static bool IsPrintable(char b) {
		return !char.IsControl(b) && b >= 32 && b <= 126;
	}

	static bool IsPrintable(byte b) {
		return b >= 32 && b <= 126;
	}
}

class StreamString {
	Stream ioStream;
	Socket socket;
	string os;

	public StreamString(Stream ioStream) {
		this.os = "Windows";
		this.ioStream = ioStream;
	}

	public StreamString(Socket socket) {
		this.os = "Linux";
		this.socket = socket;
	}

	public byte[] ReadBytes() {
		var metadataBytes = new byte[8];

		switch (this.os) {
			case "Windows": ioStream.Read(metadataBytes, 0, metadataBytes.Length); break;
			case "Linux": socket.Receive(metadataBytes); break;
		}

		var size = BitConverter.ToInt32(metadataBytes[4..], 0);
		var inBuffer = new byte[size];

		switch (this.os) {
			case "Windows": ioStream.Read(inBuffer, 0, size); break;
			case "Linux": socket.Receive(inBuffer); break;
		}

		return inBuffer;
	}

	public void WriteString(string outString) {
		byte[] outBuffer = Encoding.ASCII.GetBytes(outString);

		switch (this.os) {
			case "Windows":
				ioStream.Write(outBuffer, 0, outBuffer.Length);
				ioStream.Flush();
				break;

			case "Linux": socket.Send(outBuffer); break;
		}
	}
}
