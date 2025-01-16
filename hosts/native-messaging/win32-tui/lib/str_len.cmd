setlocal & :: [str, out]
	set "str=%~1"
	set len=0
	set in_cl=0

	:loop
	if defined str (
		set "str=%str:~1%"

		if "%str:~0,1%" == "" set in_cl=1
		if "%str:~0,1%" == "m" set in_cl=0

		if %in_cl% == 0 set /a len+=1
		goto loop
	)

(
	endlocal
	set %2=%len%
	exit /b 0
)
