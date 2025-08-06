from win32com import client
import json
import sys
xlApp = client.Dispatch("Excel.Application")
#print(sys.argv[1])
books = xlApp.Workbooks.Open(sys.argv[1])
count = books.Sheets.Count
data = {}
for x in range(count):
	ws = books.Worksheets[x]
	ws.Visible = 1
	#ws.PageSetup.Zoom = 80
	ws.PageSetup.Zoom = False
	#ws.PageSetup.FitToPagesTall = 1
	ws.PageSetup.Orientation = 2 # change orientation to landscape
	#ws.PageSetup.FitToPagesWide = 1
	ws.PageSetup.LeftMargin = '0.3'
	ws.PageSetup.RightMargin = '0.3'
	ws.PageSetup.TopMargin = '0.6'
	ws.PageSetup.BottomMargin = '0.6'
	ws.PageSetup.HeaderMargin = '0.3'
	ws.PageSetup.FooterMargin = '0.3'
	ws.PageSetup.PaperSize = 5 # xlPaperLegal Legal (8-1/2 in. x 14 in.)
	#ws.PageSetup.PrintArea = 'A1:E30'
	fileName = sys.argv[2] + ws.Name +'.pdf'
	data[ws.Name] = fileName
	ws.ExportAsFixedFormat(0, fileName)
close=books.Close(True)
close=xlApp.Quit
print(json.dumps(data))
	
