Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptDir

WshShell.Run "cmd /c for /f ""tokens=5"" %a in ('netstat -aon ^| findstr "":5000""') do taskkill /f /pid %a >nul 2>&1", 0, True
WshShell.Run "pythonw.exe app.py", 0, False