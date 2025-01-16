:: Microsoft Windows CMD.exe Version 10.0.22621.4317 ::

@echo off
setlocal EnabledelayedExpansion
chcp 65001

set window-width=60
set window-height=30
set "window-size=%window-width%,%window-height%"

title Bambloo - Native Messaging installer
mode %window-size%
color 0f

:: Open old CMD window
if not exist oldcmd (
	> oldcmd type nul
	start conhost %~s0
	exit
) else (
	del oldcmd
)

:: Open main screen
cls
screens\main
