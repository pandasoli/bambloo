@echo off
setlocal enabledelayedexpansion

set "manifest_name=com.elisoli.bambloo.discord"

set "op=install"
set "lang=python"
set "browser=chrome"
set id=
set "dist=C:\\Users\\%username%\\AppData\\Roaming\\bambloo"
set "entry=natmsg-bambloo"

:: Parse flags
:parse_flags
if "%~1"=="" goto end_parse

set flag=%~1
shift

if "%flag%" == "uninstall" (
	set op=uninstall
) else (
	if "%flag%" == "--lang" (
		if "%~1" == "" (
			echo Expected value after "%flag%"
			exit /b 1
		)

		set lang=%~1
		shift
	) else if "%flag%" == "--browser" (
		if "%~1" == "" (
			echo Expected value after "%flag%"
			exit /b 1
		)

		set browser=%~1
		shift
	) else if "%flag%" == "--dist" (
		if "%~1" == "" (
			echo Expected value after "%flag%"
			exit /b 1
		)

		set dist=%~1
		shift
	) else if "%flag%" == "--id" (
		if "%~1" == "" (
			echo Expected value after "%flag%"
			exit /b 1
		)

		set id=%~1
		shift
	) else (
		echo Unknown flag "%flag%"
		exit /b 1
	)
)

goto parse_flags

:end_parse

set "dist=%dist%\\%browser%"

:: Get register key
set regpath=

if "%browser%" == "firefox" (
	set "regpath=HKCU\Software\Mozilla\NativeMessagingHosts"
) else (
	set "regpath=HKCU\Software\Google\Chrome\NativeMessagingHosts"
)

:: Perform uninstall operation
if "%op%" == "uninstall" (
	reg delete "%regpath%\%manifest_name%"
	rmdir /s /q "%dist%"
	exit /b 0
)

:: Perform install operation
set manifest=< %manifest_name%.json
set remove_match=

:: Check browser info
if "%browser%" == "firefox" (
	set "remove_match=allowed_origins"
) else (
	set "remove_match=allowed_extensions"
)

if not defined id (
	echo Missing extension ID
	exit /b 1
)

:: Get executable extension
set ext=

if "%lang%" == "python" ( set "ext=py"
) else (
	echo Unknown lang
	exit /b 1
)

:: Install
mkdir "%dist%" 2> nul
mkdir "%dist%\%lang%"
xcopy /e "%lang%" "%dist%\%lang%"

if "%browser%" == "firefox" (
	del "%dist%\%entry%.cmd" 2> nul
	> "%dist%\%entry%.cmd"  echo @echo off
	>> "%dist%\%entry%.cmd" echo py -u "%dist%\%lang%\%entry%.%ext%"
)

del "%dist%\%manifest_name%.json" 2> nul
for /f "delims=" %%a in (%manifest_name%.json) do (
	set line=%%a

	echo !line! | findstr /c:"%remove_match%" >nul
	if errorlevel 1 (
		set line=!line:$ID=%id%!
		if "%browser%" == "firefox" (
			set line=!line:$PATH=%dist%\\%entry%.cmd!
		) else (
			set line=!line:$PATH=%dist%\\%lang%\\%entry%.%ext%!
		)
		echo !line! >> "%dist%\%manifest_name%.json"
	)
)

reg add "%regpath%\%manifest_name%" /ve /t REG_SZ /d "%dist%\%manifest_name%.json" /f
