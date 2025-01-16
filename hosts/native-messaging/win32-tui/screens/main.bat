setlocal EnableDelayedExpansion

set operation=
set browser=
set lang=
set id=

set listish_opts="height=3 width=%window-width% unsel_align=center up_ch=wk down_ch=sj sel_cl=1 unsel_cl=90"
set "step=operation"


set "manifest_name=com.elisoli.bambloo.discord"
set "entry=natmsg-bambloo"
set "dist=C:\\Users\\%username%\\AppData\\Roaming\\bambloo"
set regpath=
set remove_match=
set ext=


:main (
	cls
	echo.

	set "text=[1;34m  Bambloo  ⋆｡ﾟ☁︎｡⋆｡ ﾟ☾ ﾟ｡⋆[m"
	call lib\str_align "!text!", "center-left", %window-width%, out
	echo !out!

	set "text=[90mNative Messaging installer[m"
	call lib\str_align "!text!", "center-left", %window-width%, out
	echo !out!

	if "%step%" == "operation" (
		call :operation
		if errorlevel 0 set "step=browser"
		if errorlevel 1 exit
		goto main
	)

	if "%step%" == "browser" (
		call :browser
		if errorlevel 1 exit
		if errorlevel 0 (
			if /i "!operation!" == "uninstall" (
				set "step=uninstall"
			) else (
				set "step=lang"
			)
		)
		goto main
	)

	if "%step%" == "lang" (
		call :lang
		if errorlevel 0 set "step=id"
		if errorlevel 1 set "step=browser"
		goto main
	)

	if "%step%" == "id" (
		call :id
		if errorlevel 0 set "step=install"
		if errorlevel 1 set "step=lang"
		goto main
	)

	if "%step%" == "uninstall" (
		call :uninstall
		echo.
		pause

		set "step=done"
		goto main
	)

	if "%step%" == "install" (
		call :install
		echo.
		pause

		set "step=done"
		goto main
	)

	call :done
	exit
)

:operation (
	call lib\set_cursor_pos 0, 12
	set "text=[90m[Up] W [Down] S [Select] D[m"
	call lib\str_align "!text!", "center-left", %window-width%, out
	echo !out!
	call lib\set_cursor_pos 0, 8

	set ops="Install" "Uninstall" "Quit"
	call lib\listish %listish_opts%, ops, out
	set operation=!out!

	if /i "!out!" == "Quit" exit /b 1
	exit /b 0
)

:browser (
	call lib\set_cursor_pos 0, 13
	set "text=[90m[Up] W [Down] S [Select] D[m"
	call lib\str_align "!text!", "center-left", %window-width%, out
	echo !out!
	call lib\set_cursor_pos 0, 8

	set browsers="Google Chrome" "Firefox" "Opera GX" "Quit"
	call lib\listish %listish_opts%, browsers, out
	set browser=!out!

	if /i "!out!" == "Quit" exit /b 1

	set "dist=!dist!\\!browser!"

	if /i "!browser!" == "firefox" (
		set "regpath=HKCU\Software\Mozilla\NativeMessagingHosts"
	) else (
		set "regpath=HKCU\Software\Google\Chrome\NativeMessagingHosts"
	)

	if /i "!browser!" == "firefox" (
		set "remove_match=allowed_origins"
	) else (
		set "remove_match=allowed_extensions"
	)

	exit /b 0
)

:lang (
	call lib\set_cursor_pos 0, 11
	set "text=[90m[Up] W [Down] S [Select] D[m"
	call lib\str_align "!text!", "center-left", %window-width%, out
	echo !out!
	call lib\set_cursor_pos 0, 8

	set langs="Python" "Go back"
	call lib\listish %listish_opts%, langs, out
	set lang=!out!

	if /i "!out!" == "Go back" exit /b 1

	if /i "!lang!" == "python" (
		set "ext=py"
	)

	exit /b 0
)

:id (
	call lib\set_cursor_pos 0, 8
	set /p "id=Enter your id: "

	if /i "!id!" == "back" exit /b 1
	exit /b 0
)

:uninstall (
	call lib\set_cursor_pos 0, 8

	reg delete "!regpath!\!manifest_name!"
	rmdir /s /q "!dist!"

	exit /b 0
)

:install (
	call lib\set_cursor_pos 0, 8

	set manifest=< "..\!manifest_name!.json"

	mkdir "!dist!" 2> nul
	mkdir "!dist!\!lang!"
	xcopy /e "..\!lang!" "!dist!\!lang!"

	if /i "!browser!" == "firefox" (
		del "!dist!\!entry!.cmd" 2> nul
		> "!dist!\!entry!.cmd"  echo @echo off
		>> "!dist!\!entry!.cmd" echo py -u "!dist!\!lang!\!entry!.!ext!"
	)

	del "!dist!\!manifest_name!.json" 2> nul
	for /f "usebackq delims=" %%a in ("..\!manifest_name!.json") do (
		set line=%%a

		echo !line! | findstr /c:"!remove_match!" >nul
		if errorlevel 1 (

			for %%b in (!id!) do set line=!line:$ID=%%b!

			if /i "!browser!" == "firefox" (
				for /f "tokens=1,2 delims= " %%b in ("!dist! !entry!") do set line=!line:$PATH=%%b\\%%b.cmd!
			) else (
				for /f "tokens=1,2,3,4 delims= " %%b in ("!dist! !lang! !entry! !ext!") do set line=!line:$PATH=%%b\\%%c\\%%d.%%e!
			)
			echo !line! >> "!dist!\!manifest_name!.json"
		)
	)

	reg add "!regpath!\!manifest_name!" /ve /t REG_SZ /d "!dist!\!manifest_name!.json" /f

	exit /b 0
)

:done (
	call lib\set_cursor_pos 0, 8

	set text=
	if /i "%operation%" == "install" (
		set "text=Installed"
	) else (
		set "text=Uninstalled"
	)

	set "text=[1;33m%text% Successfully!!! ✨[m"
	call lib\str_align "!text!", "center-left", %window-width%, out
	echo !out!

	timeout /t 3 > nul
	exit /b 0
)
