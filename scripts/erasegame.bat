@echo off
if not exist server\db_initial.json goto nogame
if not exist server\db.json goto nogame

del server\db_initial.json
del server\db.json
exit

:nogame
echo You must first create a game in order to erase it.