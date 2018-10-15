cd /Users/jfoster/Mastery/
echo "This will reload your GemStone environment."
echo "Make sure you have saved all your edits!"
read -n 1 -s -r -p "Press any key to continue"
topaz -l << EOF
iferr 1 stk
iferr 2 output pop
iferr 3 stk
iferr 4 abort
iferr 5 logout
iferr 6 exit
errorCount
output push WebGS.out only
input WebGS.gs
input JSON.gs
output pop
errorCount
output push Mastery.out only
input MasteryGlobals.gs
output pop
errorCount
commit
iferr 1 stk
iferr 2 exit
send Mastery run
EOF
