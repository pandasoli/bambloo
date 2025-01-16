setlocal & :: [x out, y out]
	set x=
	set y=
	set semi=0

	set char=
	set pos=2

	:loop
	echo|set /p "=[6n" 
	for /l %%# in (1 1 %pos%) do pause < con > nul
	for /f "eol=" %%c in ('"replace /w ? . < con"') do set char=%%c

	if "%char%" == "R" (
		goto done
	) else if "%char%" == ";" (
		set semi=1
	) else (
		if %semi% == 1 (
			set x=%x%%char%
		) else (
			set y=%y%%char%
		)
	)

	set /a pos+=1
	goto loop
	:done
(
	endlocal
	set %1=%x%
	set %2=%y%
	exit /b 0
)
