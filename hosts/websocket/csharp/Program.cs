using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Text.Json.Serialization;
using WebSocketSharp;
using WebSocketSharp.Server;


record SimpleEvent(
	[property: JsonPropertyName("event")]
	string eventName
);

record UpdateEvent(
	[property: JsonPropertyName("event")]
	string eventName,
	int tabId,
	Activity activity
);

record RemoveEvent(
	[property: JsonPropertyName("event")]
	string eventName,
	int tabId
);

record FocusEvent(
	[property: JsonPropertyName("event")]
	string eventName,
	int tabId
);

public class Bambloo : WebSocketBehavior {
	Discord discord;
	Dictionary<int, Activity> activities = new Dictionary<int, Activity>();
	int focusedId = 0;

	public Bambloo(Discord discord) {
		this.discord = discord;
	}

	protected override void OnOpen() {
		var details = new { multiple = false };

		Send(JsonSerializer.Serialize(details));
		Console.WriteLine($"{Context.UserEndPoint} connected");
	}

	protected override void OnMessage(MessageEventArgs e) {
		var data = JsonSerializer.Deserialize<SimpleEvent>(e.Data);

		Console.WriteLine($"\x1b[1;33m{data!.eventName}\x1b[m");

		switch (data.eventName) {
			case "update": HandleUpdateEvent(e.Data); break;
			case "remove": HandleRemoveEvent(e.Data); break;
			case "focus": HandleFocusEvent(e.Data); break;
		}
	}

	private void HandleUpdateEvent(string msg) {
		var data = JsonSerializer.Deserialize<UpdateEvent>(msg);
		int tabId = data!.tabId;
		Activity activity = data!.activity;

		focusedId = tabId;
		activities[tabId] = activity;

		var (success, msg_, _) = discord.SetActivity(activity);
		if (!success) Console.WriteLine($"\x1b[31m{msg_}\x1b[m");
	}

	private void HandleRemoveEvent(string msg) {
		var data = JsonSerializer.Deserialize<RemoveEvent>(msg);
		int tabId = data!.tabId;

		activities.Remove(tabId);

		if (focusedId == tabId)
			discord.ClearActivity();
	}

	private void HandleFocusEvent(string msg) {
		var data = JsonSerializer.Deserialize<FocusEvent>(msg);
		int tabId = data!.tabId;

		if (activities.ContainsKey(tabId)) {
			focusedId = tabId;
			var (success, msg_, _) = discord.SetActivity(activities[tabId]);
			if (!success) Console.WriteLine($"\x1b[31m{msg_}\x1b[m");
		}
		else
			Console.WriteLine($"No activity for {tabId}");
	}

	protected override void OnClose(CloseEventArgs e) {
		/*Console.WriteLine($"{Context.UserEndPoint} disconnected");*/
		Console.WriteLine("Some client disconnected");
	}
}

class App {
	static void Main() {
		var discord = new Discord();

		bool connected, success;
		string[] errors;
		string? msg;
		object? res;

		(connected, errors) = discord.Connect();
		if (!connected) {
			Console.WriteLine($"Couldn't connect:");
			for (int i = 0; i < errors.Length; ++i)
				if (errors[i] != null)
					Console.WriteLine($"  {errors[i]}\n");
			return;
		}

		(success, msg, res) = discord.Authorize();
		if (!success) {
			Console.WriteLine($"Couldn't authorize: {msg}");
			return;
		}

		/*var activity = new Activity(*/
		/*	"Some state",*/
		/*	"Some detail",*/
		/*	null,*/
		/*	new ActivityAssets(null, null, null, null),*/
		/*	new ActivityButton[] {*/
		/*		new ActivityButton("Search it too", "https://duckduckgo.com")*/
		/*	}*/
		/*);*/

		var url = "ws://localhost:8765";
		var wssv = new WebSocketServer(url);
		wssv.AddWebSocketService<Bambloo>("/", () => new Bambloo(discord));
		wssv.Start();

		Console.WriteLine(url);
		Console.ReadKey(true);
		wssv.Stop();
	}
}
