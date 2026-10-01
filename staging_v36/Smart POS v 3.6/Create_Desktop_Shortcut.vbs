Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
desktopPath = WshShell.SpecialFolders("Desktop")
shortcutPath = desktopPath & "\Smart POS v 3.6.lnk"

Set shortcut = WshShell.CreateShortcut(shortcutPath)
If fso.FileExists(scriptDir & "\Smart_POS.exe") Then
    shortcut.TargetPath = scriptDir & "\Smart_POS.exe"
Else
    shortcut.TargetPath = scriptDir & "\start_pos.bat"
End If
shortcut.WorkingDirectory = scriptDir
shortcut.Description = "Smart POS System v 3.6"
If fso.FileExists(scriptDir & "\app.ico") Then
    shortcut.IconLocation = scriptDir & "\app.ico,0"
End If
shortcut.Save

WScript.Echo "Shortcut created successfully on Desktop: Smart POS v 3.6.lnk"