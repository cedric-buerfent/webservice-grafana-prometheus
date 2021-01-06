# --------------- web.py Python Webserver ---------
#  Listens on Port 9091 or 8081
#  API: Takes GET values and branches

# -----------------   This is the backend of the prometheus configurator
#                     01.10.2020 CB
#   It runs as a service on Linux:
#         systemctl status prometheus-api
#   To see logs: journalctl  --full -u prometheus-api -f
#
#   Service looks like this:
# vi /usr/lib/systemd/system/prometheus-api.service
# [Unit]
# Description=prometheus-api
# After=syslog.target network.target
#
# [Service]
# Type=simple
# WorkingDirectory=/usr/local/prometheus-api
# Environment="VIRTUAL_ENV=/usr/local/prometheus-api/venv"
# Environment="PATH=$VIRTUAL_ENV/bin:$PATH"
# ExecStart=/usr/local/prometheus-api/venv/bin/python backend.py 9091

#[Install]
#WantedBy=multi-user.target


#For windows we do:
#cd C:\programmieren\PYTHON\200625_PYYAML_GRAFANA
#call venv\Scripts\activate.bat
#python backend.py 8081

# --- TEST:   See API Doc
# http://127.0.0.1:8081/
# http://127.0.0.1:8081/createnetdataagent?ip=127.0.0.1&hostname=netdatatest&group=Group_TEST
# http://127.0.0.1:8081/deletenetdataagent?ip=127.0.0.1&hostname=netdatatest&group=Group_TEST

#Library web.py for python Webserver
import web

#Library to handle yaml files
import yaml

#other python libraries here
import shutil #copy file
import time
import datetime
import os
import traceback
import sys
import __builtin__
import re


# ----  every html Homepage gets a branch. There a class is named:
urls = (	
	'/', 'test',
	'/test/index.html', 'test',
	'/ping','ping',
	'/configcheck','configcheck',
	'/reload','reload',
	'/pingdelete','pingdelete',
	'/createnetdataagent','createnetdataagent',
	'/deletenetdataagent','deletenetdataagent',
	'/createwmiagent','createwmiagent',
	'/deletewmiagent','deletewmiagent',
 )
 

#classname given by tree entry
class test:
	# class simply returns a json
	# --------------------- GET -------------------------------------
	def GET(self):
		#server side allow Cross Origin queries
		web.header('Access-Control-Allow-Origin', '*')
		web.header('Access-Control-Allow-Credentials', 'true')	

        #return json text MIME
		web.header('Content-Type', 'application/json')

		return '{"Command":"GET","RES":"[OK] Test fine!"}'
		#json_return = "{\"Command\":\""+user_data.command.upper()+"\","+mitte+"}"
	
	# --------------------- POST ------------------------------------
	def POST(self):
		#server side allow Cross Origin queries		
		web.header('Access-Control-Allow-Origin',      '*')
		web.header('Access-Control-Allow-Credentials', 'true')

		print web.input()
		
		#return json text MIME
		web.header('Content-Type', 'application/json')
		
		return '{"Command":"POST","Say":"Test OK!"}'
 
# ------------    global functions  and global variables

class cInput:
	#login handler
	#data    = {}
	cmd      = ""  # e.g. ping
	ip       = ""
	hostname = ""
	group    = ""
	returnmessage = ""
		

def read_prometheus_file_into_memory():
	f = open("prometheus.yml")
	all = yaml.load(f,Loader=yaml.FullLoader)
	f.close()
	return all
#all = read_prometheus_file_into_memory()

def write_prometheus_file(aPrometheusObject,aFilename):
	# -- schreiben	
	#f = open("out.yml","w")
	f = open(aFilename,"w")
	yaml.dump(aPrometheusObject,f)
	f.close()
	#/opt/prometheus/promtool  check config /tmp/out.yml   test ok
	
def create_prometheusfile_backup():
	aBackupName =  new_filename()		
	# -- duplicate file
	#shutil.copy('file1.txt', 'file3.txt')
	shutil.copy("prometheus.yml", "CACHE/"+aBackupName)
	
# --- display on stdout e.g. Current Time: 26.05.2020 17:05:20  
def display_current_time():
	t  = datetime.datetime.now()
	t2 = t.timetuple()		
	print "Current Time: "+time.strftime("%d.%m.%Y %H:%M:%S", t2)

#prometheus.yml.20201001_17_19_05	
def new_filename():
	t  = datetime.datetime.now()
	t2 = t.timetuple()
	mystring = "prometheus.yml."
	mystring = 	mystring +time.strftime("%Y%m%d_%H_%M_%S", t2)
	print mystring
	return mystring

# ----------------------------------------------------- FUNCTION INSERT PING -------------------------------------------
def insert_ping(values):
	#display values
	print "IP   :"+values.ip
	print "Host :"+values.hostname
	print "Group:"+values.group
	
	#check if empty and abord
	if values.ip == "" or values.hostname == "" or values.group == "": 
		print "some GET values empty. I got: IP:"+values.ip+" hostname:"+values.hostname+" group:"+values.group
		return 0
	else:
		print "ok. Got all GET values."
		
	
	#load yml file
	all = read_prometheus_file_into_memory()

	# -- because array index number is necessary to access job_name
	index = -1
	# -- inside job_name we count the number of entries / machines
	max_entries = -1
	# -- navigieren to find ping array index
	for i,v in enumerate(all["scrape_configs"]):
		if v["job_name"] == "ping-normal":
			#print "Array-Nr "+str(i)
			#save found index nr
			index = i
			print "Ping index found:  "+str(index)
			#print v
			# -- print what is inside job_name
			for j,v in enumerate(v["static_configs"]):
				#nop
				pass
				#print j
				#print v["targets"]
				#print v["labels"]["name"]
				#print j
			max_entries = j
			print "Max entries found: "+str(max_entries)

	# -- some basic error handling	
	if index == -1:
		print "Sorry, job_name does not exist inside yml File"
		return 0
	if max_entries == -1 or max_entries == 0:
		print "Sorry. No target exists inside job_name. Thats strange. Better stop here."
		return 0
		
	# -- first checking if name is free and does not exist. Else break
	#all["scrape_configs"][11]["static_configs"][9]["labels"]["name"] = 'srv-adm-08'
	#for i,v in enumerate(all["scrape_configs"][index]["static_configs"]):
	#	#print  v
	#	aHost =  v["labels"]["name"]
	#	#print aHost
	#	if aHost == values.hostname:
	#		print "Sorry. Name "+aHost+ " does exists in list. Better stop here."
	#		return 0
			
	# -- check if IP exists twice. If yes. We then check for same hostname which is not allowed.
	#all["scrape_configs"][11]["static_configs"][9]["targets"][0] = '192.168.239.18'
	for i,v in enumerate(all["scrape_configs"][index]["static_configs"]):
		aIP = v["targets"][0]
		if aIP == values.ip:
			aHost = v["labels"]["name"]
			print "Same IP: "+aIP+". Checking if same hostname: "+aHost
			
			if aHost.lower() == values.hostname.lower():
				print "Same Hostname."
				print "Sorry. Same IP and same hostname is not allowed. Better stop here."
				values.returnmessage = "[ERROR] Sorry. Same IP and same hostname is not allowed. Better stop here."
				return 0
			
	# -- arrived here we are rather fine to insert.
		
	# -- we construct our machine to enter: E.g. the yaml-entry:
	#- targets:
	#  - 172.24.100.75
	#  labels:
	#    name: "glus-tech-02"
	#    group: "Group_BIG"
	#    active: "true"
	# becomes:   
	# {'labels': {'active': 'true', 'group': 'Group_MyGroup', 'name': 'srv-test-99'}, 'targets': ['99.99.99.99']}
	# and we construct the object here:
	a={}
	#a["targets"] = ["99.99.99.99"]
	a0=[]
	a0.append(values.ip)
	a["targets"] = a0
	b={}
	b["active"] = "true"
	b["group"] = values.group
	b["name"] = values.hostname
	a["labels"] = b
	#print a

	# -- append to datastructure 		
	#all["scrape_configs"][9]["static_configs"].append(a)
	all["scrape_configs"][index]["static_configs"].append(a)
				
	print "All entries:"
	#print all["scrape_configs"][index]["static_configs"]
	for i,v in enumerate(all["scrape_configs"][index]["static_configs"]):
		print  v
		
	#take a backup of previous yml file
	create_prometheusfile_backup()
	
		
	#write new prometheus file
	time.sleep(1)
	#write_prometheus_file(all,"new.yml")
	write_prometheus_file(all,"prometheus.yml")
	values.returnmessage = "[OK]. All fine."
	 

# ----------------------------------------------------- FUNCTION DELETE PING -------------------------------------------
def delete_ping(values):
	#display values
	print "IP   :"+values.ip
	print "Host :"+values.hostname
	print "Group:"+values.group
	
	#load yml file
	all = read_prometheus_file_into_memory()
	
	# -- because array index number is necessary to access job_name
	index = -1
	# -- inside job_name we count the number of entries / machines
	max_entries = -1
	# -- navigieren to find ping array index
	for i,v in enumerate(all["scrape_configs"]):
		if v["job_name"] == "ping-normal":
			#print "Array-Nr "+str(i)
			#save found index nr
			index = i
			print "Ping index found:  "+str(index)
			#print v
			# -- print what is inside job_name
			for j,v in enumerate(v["static_configs"]):
				#nop
				pass
				#print j
				#print v["targets"]
				#print v["labels"]["name"]
				#print j
			max_entries = j
			print "Max entries found: "+str(max_entries)
	
	# -- some basic error handling	
	if index == -1:
		print "Sorry, job_name does not exist inside yml File"
		return 0
	if max_entries == -1 or max_entries == 0:
		print "Sorry. No target exists inside job_name. Thats strange. Better stop here."
		return 0
	#print all["scrape_configs"][index]	
		
	# -- walk backward and find matches to delete. Because deletion moves every element to front
	#range 3rd arg is step. 2nd arg is stop+1.
	deleted=0
	for i in range(max_entries,-1,-1):
		#print i
		aHost  = ""
		aIP    = ""
		aGroup = ""
		try:
			aHost  = all["scrape_configs"][index]["static_configs"][i]["labels"]["name"]
		except:
			print "unknown host"
		try:	
			aIP    = all["scrape_configs"][index]["static_configs"][i]["targets"][0]
		except:
			print "unknown IP"
		try:
			aGroup = all["scrape_configs"][index]["static_configs"][i]["labels"]["group"]
		except:
			print "unknown group"
		#print aHost
		#print aIP
		#print aGroup
		# --- check match and delete candidate if
		to_delete = False
		if aIP == values.ip:
			print "same IP"
			if aHost.lower() == values.hostname.lower():
				print "and same hostname. So delete"
				to_delete = True
				
		# --- delete inside datastructure
		if to_delete == True:
			print "removing Host:"+aHost+" IP:"+aIP+" Group:"+aGroup
			all["scrape_configs"][index]["static_configs"].pop(i)
			deleted=deleted+1
		
	if deleted > 0:		
		
		#take a backup of previous yml file
		create_prometheusfile_backup()
	
		#write new prometheus file
		time.sleep(1)
		#write_prometheus_file(all,"new.yml")
		write_prometheus_file(all,"prometheus.yml")
		
		values.returnmessage = "[OK] Deleted "+str(deleted)+" entries."
		print values.returnmessage
		return 0
		
	else:
		values.returnmessage =  "[WARN] Nothing deleted."
		print values.returnmessage
		return 1
	#print all["scrape_configs"][index]
	
# ----------------------------------------------------- FUNCTION INSERT NETDATA AGENT -------------------------------------------
def insert_linux_netdata_agent(values):
	#display values
	print "IP   :"+values.ip
	print "Host :"+values.hostname
	print "Group:"+values.group
	
	#check if empty and abord
	if values.ip == "" or values.hostname == "" or values.group == "": 
		print "some GET values empty. I got: IP:"+values.ip+" hostname:"+values.hostname+" group:"+values.group
		return 0
	else:
		print "ok. Got all GET values."
		
	
	
	#load yml file
	all = read_prometheus_file_into_memory()

	
	# -- because array index number is necessary to access job_name
	index = -1
	# -- inside job_name we count the number of entries / machines
	max_entries = -1
	# -- navigieren to find ping array index
	for i,v in enumerate(all["scrape_configs"]):
		if v["job_name"] == "netdata":
			#print "Array-Nr "+str(i)
			#save found index nr
			index = i
			print "index found:  "+str(index)
			#print v
			# -- print what is inside job_name
			for j,v in enumerate(v["static_configs"]):
				#nop
				pass
				#print j
				#print v["targets"]
				#print v["labels"]["name"]
				#print j
			max_entries = j
			print "Max entries found: "+str(max_entries)

	# -- some basic error handling	
	if index == -1:
		print "Sorry, job_name does not exist inside yml File"
		return 0
	if max_entries == -1 or max_entries == 0:
		print "Sorry. No target exists inside job_name. Thats strange. Better stop here."
		return 0
	
		
	# -- first checking if name is free and does not exist. Else break
	#all["scrape_configs"][11]["static_configs"][9]["labels"]["name"] = 'srv-adm-08'
	#for i,v in enumerate(all["scrape_configs"][index]["static_configs"]):
	#	#print  v
	#	aHost =  v["labels"]["name"]
	#	#print aHost
	#	if aHost == values.hostname:
	#		print "Sorry. Name "+aHost+ " does exists in list. Better stop here."
	#		return 0
			
	# -- check if IP exists twice. If yes. We then check for same hostname which is not allowed.
	#all["scrape_configs"][11]["static_configs"][9]["targets"][0] = '192.168.239.18'
	for i,v in enumerate(all["scrape_configs"][index]["static_configs"]):
		aIP = v["targets"][0]
		#add netdata port here
		if aIP == values.ip+":19999":
			aHost = v["labels"]["name"]
			print "Same IP: "+aIP+". Checking if same hostname: "+aHost
			
			if aHost.lower() == values.hostname.lower():
				print "Same Hostname."
				print "Sorry. Same IP and same hostname is not allowed. Better stop here."
				values.returnmessage = "[ERROR] Sorry. Same IP and same hostname is not allowed. Better stop here."
				return 0
			
	# -- arrived here we are rather fine to insert.
		
	# -- we construct our machine to enter: E.g. the yaml-entry:
	#- targets:
	#  - 172.24.100.75
	#  labels:
	#    name: "glus-tech-02"
	#    group: "Group_BIG"
	#    active: "true"
	# becomes:   
	# {'labels': {'active': 'true', 'group': 'Group_MyGroup', 'name': 'srv-test-99'}, 'targets': ['99.99.99.99']}
	# and we construct the object here:
	a={}
	#a["targets"] = ["99.99.99.99"]
	a0=[]
	#we add the netdata port here :19999
	a0.append(values.ip+":19999")
	a["targets"] = a0
	b={}
	b["active"] = "true"
	b["group"] = values.group
	b["name"] = values.hostname
	a["labels"] = b
	#print a

	# -- append to datastructure 		
	#all["scrape_configs"][9]["static_configs"].append(a)
	all["scrape_configs"][index]["static_configs"].append(a)
				
	print "All entries:"
	#print all["scrape_configs"][index]["static_configs"]
	for i,v in enumerate(all["scrape_configs"][index]["static_configs"]):
		print  v
			
	#take a backup of previous yml file
	create_prometheusfile_backup()
	
		
	#write new prometheus file
	time.sleep(1)
	#write_prometheus_file(all,"new.yml")
	write_prometheus_file(all,"prometheus.yml")
	values.returnmessage = "[OK]. All fine."
# ----------------------------------------------------- FUNCTION DELETE NETDATA AGENT -------------------------------------------
def delete_linux_netdata_agent(values):
	#display values
	print "IP   :"+values.ip
	print "Host :"+values.hostname
	print "Group:"+values.group
	
	#load yml file
	all = read_prometheus_file_into_memory()
	
	# -- because array index number is necessary to access job_name
	index = -1
	# -- inside job_name we count the number of entries / machines
	max_entries = -1
	# -- navigieren to find ping array index
	for i,v in enumerate(all["scrape_configs"]):
		if v["job_name"] == "netdata":
			#print "Array-Nr "+str(i)
			#save found index nr
			index = i
			print "index found:  "+str(index)
			#print v
			# -- print what is inside job_name
			for j,v in enumerate(v["static_configs"]):
				#nop
				pass
				#print j
				#print v["targets"]
				#print v["labels"]["name"]
				#print j
			max_entries = j
			print "Max entries found: "+str(max_entries)
	
	# -- some basic error handling	
	if index == -1:
		print "Sorry, job_name does not exist inside yml File"
		return 0
	if max_entries == -1 or max_entries == 0:
		print "Sorry. No target exists inside job_name. Thats strange. Better stop here."
		return 0
	#print all["scrape_configs"][index]	
		
	# -- walk backward and find matches to delete. Because deletion moves every element to front
	#range 3rd arg is step. 2nd arg is stop+1.
	deleted=0
	for i in range(max_entries,-1,-1):
		#print i
		aHost  = ""
		aIP    = ""
		aGroup = ""
		try:
			aHost  = all["scrape_configs"][index]["static_configs"][i]["labels"]["name"]
		except:
			print "unknown host"
		try:	
			aIP    = all["scrape_configs"][index]["static_configs"][i]["targets"][0]
		except:
			print "unknown IP"
		try:
			aGroup = all["scrape_configs"][index]["static_configs"][i]["labels"]["group"]
		except:
			print "unknown group"
		#print aHost
		#print aIP
		#print aGroup
		# --- check match and delete candidate if
		to_delete = False		
		#add netdata port here
		if aIP == values.ip+":19999":
			print "same IP"
			if aHost.lower() == values.hostname.lower():
				print "and same hostname. So delete"
				to_delete = True
				
		# --- delete inside datastructure
		if to_delete == True:
			print "removing Host:"+aHost+" IP:"+aIP+" Group:"+aGroup
			all["scrape_configs"][index]["static_configs"].pop(i)
			deleted=deleted+1
		
	if deleted > 0:		
		
		#take a backup of previous yml file
		create_prometheusfile_backup()
	
		#write new prometheus file
		time.sleep(1)
		#write_prometheus_file(all,"new.yml")
		write_prometheus_file(all,"prometheus.yml")
		
		values.returnmessage = "[OK] Deleted "+str(deleted)+" entries."
		print values.returnmessage
		return 0
		
	else:
		values.returnmessage =  "[WARN] Nothing deleted."
		print values.returnmessage
		return 1
	#print all["scrape_configs"][index]
	
# ----------------------------------------------------- FUNCTION INSERT WMI AGENT -------------------------------------------
def insert_windows_wmi_agent(values):
	#display values
	print "IP   :"+values.ip
	print "Host :"+values.hostname
	print "Group:"+values.group
	
	#check if empty and abord
	if values.ip == "" or values.hostname == "" or values.group == "": 
		print "some GET values empty. I got: IP:"+values.ip+" hostname:"+values.hostname+" group:"+values.group
		return 0
	else:
		print "ok. Got all GET values."
			
	#load yml file
	all = read_prometheus_file_into_memory()

	# -- because array index number is necessary to access job_name
	index = -1
	# -- inside job_name we count the number of entries / machines
	max_entries = -1
	# -- navigieren to find ping array index
	for i,v in enumerate(all["scrape_configs"]):
		if v["job_name"] == "wmi-exporter":
			#print "Array-Nr "+str(i)
			#save found index nr
			index = i
			print "index found:  "+str(index)
			#print v
			# -- print what is inside job_name
			for j,v in enumerate(v["static_configs"]):
				#nop
				pass
				#print j
				#print v["targets"]
				#print v["labels"]["name"]
				#print j
			max_entries = j
			print "Max entries found: "+str(max_entries)

	# -- some basic error handling	
	if index == -1:
		print "Sorry, job_name does not exist inside yml File"
		return 0
	if max_entries == -1 or max_entries == 0:
		print "Sorry. No target exists inside job_name. Thats strange. Better stop here."
		return 0
		
	# -- first checking if name is free and does not exist. Else break
	#all["scrape_configs"][11]["static_configs"][9]["labels"]["name"] = 'srv-adm-08'
	#for i,v in enumerate(all["scrape_configs"][index]["static_configs"]):
	#	#print  v
	#	aHost =  v["labels"]["name"]
	#	#print aHost
	#	if aHost == values.hostname:
	#		print "Sorry. Name "+aHost+ " does exists in list. Better stop here."
	#		return 0
			
	# -- check if IP exists twice. If yes. We then check for same hostname which is not allowed.
	#all["scrape_configs"][11]["static_configs"][9]["targets"][0] = '192.168.239.18'
	for i,v in enumerate(all["scrape_configs"][index]["static_configs"]):
		aIP = v["targets"][0]
		#add wmi exporter port here
		if aIP == values.ip+":9182":
			aHost = v["labels"]["name"]
			print "Same IP: "+aIP+". Checking if same hostname: "+aHost
			
			if aHost.lower() == values.hostname.lower():
				print "Same Hostname."
				print "Sorry. Same IP and same hostname is not allowed. Better stop here."
				values.returnmessage = "[ERROR] Sorry. Same IP and same hostname is not allowed. Better stop here."
				return 0
			
	# -- arrived here we are rather fine to insert.
		
	# -- we construct our machine to enter: E.g. the yaml-entry:
	#- targets:
	#  - 172.24.100.75
	#  labels:
	#    name: "glus-tech-02"
	#    group: "Group_BIG"
	#    active: "true"
	# becomes:   
	# {'labels': {'active': 'true', 'group': 'Group_MyGroup', 'name': 'srv-test-99'}, 'targets': ['99.99.99.99']}
	# and we construct the object here:
	a={}
	#a["targets"] = ["99.99.99.99"]
	a0=[]
	#we add the wmi port here :9182
	a0.append(values.ip+":9182")
	a["targets"] = a0
	b={}
	b["active"] = "true"
	b["group"] = values.group
	b["name"] = values.hostname
	a["labels"] = b
	#print a

	# -- append to datastructure 		
	#all["scrape_configs"][9]["static_configs"].append(a)
	all["scrape_configs"][index]["static_configs"].append(a)
				
	print "All entries:"
	#print all["scrape_configs"][index]["static_configs"]
	for i,v in enumerate(all["scrape_configs"][index]["static_configs"]):
		print  v
			
	#take a backup of previous yml file
	create_prometheusfile_backup()
	
		
	#write new prometheus file
	time.sleep(1)
	#write_prometheus_file(all,"new.yml")
	write_prometheus_file(all,"prometheus.yml")
	values.returnmessage = "[OK]. All fine."

# ----------------------------------------------------- FUNCTION DELETE WMI AGENT -------------------------------------------
def delete_windows_wmi_agent(values):
	#display values
	print "IP   :"+values.ip
	print "Host :"+values.hostname
	print "Group:"+values.group
	
	#load yml file
	all = read_prometheus_file_into_memory()
	
	# -- because array index number is necessary to access job_name
	index = -1
	# -- inside job_name we count the number of entries / machines
	max_entries = -1
	# -- navigieren to find ping array index
	for i,v in enumerate(all["scrape_configs"]):
		if v["job_name"] == "wmi-exporter":
			#print "Array-Nr "+str(i)
			#save found index nr
			index = i
			print "index found:  "+str(index)
			#print v
			# -- print what is inside job_name
			for j,v in enumerate(v["static_configs"]):
				#nop
				pass
				#print j
				#print v["targets"]
				#print v["labels"]["name"]
				#print j
			max_entries = j
			print "Max entries found: "+str(max_entries)
	
	# -- some basic error handling	
	if index == -1:
		print "Sorry, job_name does not exist inside yml File"
		return 0
	if max_entries == -1 or max_entries == 0:
		print "Sorry. No target exists inside job_name. Thats strange. Better stop here."
		return 0
	#print all["scrape_configs"][index]	
		
	# -- walk backward and find matches to delete. Because deletion moves every element to front
	#range 3rd arg is step. 2nd arg is stop+1.
	deleted=0
	for i in range(max_entries,-1,-1):
		#print i
		aHost  = ""
		aIP    = ""
		aGroup = ""
		try:
			aHost  = all["scrape_configs"][index]["static_configs"][i]["labels"]["name"]
		except:
			print "unknown host"
		try:	
			aIP    = all["scrape_configs"][index]["static_configs"][i]["targets"][0]
		except:
			print "unknown IP"
		try:
			aGroup = all["scrape_configs"][index]["static_configs"][i]["labels"]["group"]
		except:
			print "unknown group"
		#print aHost
		#print aIP
		#print aGroup
		# --- check match and delete candidate if
		to_delete = False
		#add wmi exporter port here
		if aIP == values.ip+":9182":
			print "same IP"
			if aHost.lower() == values.hostname.lower():
				print "and same hostname. So delete"
				to_delete = True
				
		# --- delete inside datastructure
		if to_delete == True:
			print "removing Host:"+aHost+" IP:"+aIP+" Group:"+aGroup
			all["scrape_configs"][index]["static_configs"].pop(i)
			deleted=deleted+1
		
	if deleted > 0:		
		
		#take a backup of previous yml file
		create_prometheusfile_backup()
	
		#write new prometheus file
		time.sleep(1)
		#write_prometheus_file(all,"new.yml")
		write_prometheus_file(all,"prometheus.yml")
		
		values.returnmessage = "[OK] Deleted "+str(deleted)+" entries."
		print values.returnmessage
		return 0
		
	else:
		values.returnmessage =  "[WARN] Nothing deleted."
		print values.returnmessage
		return 1
	#print all["scrape_configs"][index]
		 	
# ---------------------------------------------------------------------------
# System Call Function: Returns the output of the call
# via a tmp.txt file
# ---------------------------------------------------------------------------
def aexec_command(aCommand,tempfile):
	global script_cachefolder
	#global script_syscall
	#tmp_txt = script_cachefolder + "tmp.txt"
	#print tmp_txt
	try:
		tmp_txt = tempfile	
		#cmd = "dir > tmp.txt"
		#cmd = "%s"%aCommand
		#system(aCommand+" > tmp.txt")
		#os.system(aCommand+" >"+ tmp_txt + " 2>&1")
		os.system(aCommand+" >"+ tmp_txt)
		afile = __builtin__.open(tmp_txt)
		data=afile.read()
		afile.close()
		data_lines = data.split("\n")
		#for e in data_lines:
		#	print e
		return data_lines
	except:
		print "error in systemcall "+aCommand
		traceback.print_exc(file=sys.stdout)

def configcheck_prometheus():
	print "[configcheck_prometheus]"
	# -- simulate if we are on windows. Real call if we are on linux
	aOS = os.name
	results = []
	if re.compile("posix").search(aOS.lower()):
		#Linux
		results = aexec_command("/root/bin/configcheck.sh 2>&1|/usr/bin/tee ","CACHE/configcheck.txt")
	elif re.compile("nt").search(aOS):
		#win
		print "windows."
		results = aexec_command("configcheck_prometheus.bat","CACHE/configcheck.txt")
	else:
		#unknown
		#NOP
		pass
		return "wrong OS"
	# -- handle result
	print "txt Logfile says:"
	for r in results:
		print r
	print results
	status="success"
	for r in results:
		if re.compile("error").search(r.lower()):
			#error found. and stop
			status="error"
			#loop verlassen
			break
		if re.compile("failed").search(r.lower()):
			#error found. and stop
			status="error"
			#loop verlassen
			break	
		if re.compile("warn").search(r.lower()):
			if status == "error":
				print "(ignore warn)."
				#ignore
			else:
				status="warning"
		
	#print "Overall result is:"
	#print status
	#return "Result status is: "+status
	if status == "success":
		retval = "[OK] Configuration is fine."
		print retval
		return retval
	elif status == "warning":
		retval = "[WARN] Configuration has warnings."
		print retval
		return retval
	elif status == "error":
		retval = "[BAD] Configuration is not good."
		print retval
		return retval
	else:
		retval = "[UNKNOWN] Configuration is ... I dont know. So check prometheus logs."
		print retval
		return retval	
	
def reload_prometheus():
	print "[reload_prometheus]"
	# -- simulate if we are on windows. Real call if we are on linux
	aOS = os.name
	results = []
	if re.compile("posix").search(aOS.lower()):
		#Linux
		results = aexec_command("/root/bin/reload-prometheus.sh 2>&1|/usr/bin/tee ","CACHE/reload.txt")
	elif re.compile("nt").search(aOS):
		#win
		print "windows."
		results = aexec_command("reload_prometheus.bat","CACHE/reload.txt")
	else:
		#unknown
		#NOP
		pass
		return "wrong OS"
	# -- handle result
	#print results
	# -- normally reload_prometheus is empty. Anything else is strange so at least warning
	#counting number of lines returned
	c=0
	status="success"
	for r in results:
		c=c+1
		if re.compile("error").search(r.lower()):
			#error found. and stop
			status="error"
			#loop verlassen
			break
		if re.compile("failed").search(r.lower()):
			#error found. and stop
			status="error"
			#loop verlassen
			break
	print "Lines"+str(c)
	#if c > 1:
	#	status="warning"
		
	if status == "success":
		retval = "[OK] Reload is fine."
		print retval
		return retval
	elif status == "warning":
		retval = "[WARN] Reload has warnings."
		print retval
		return retval
	elif status == "error":
		retval = "[BAD] Reload is not good."
		print retval
		return retval
	else:
		retval = "[UNKNOWN] Reload is ... I dont know. So check prometheus logs."
		print retval
		return retval	
		
		

#classname given by tree entry
class ping:	
	# --------------------- GET -------------------------------------
	def GET(self):
		#server side allow Cross Origin queries
		web.header('Access-Control-Allow-Origin', '*')
		web.header('Access-Control-Allow-Credentials', 'true')
		
		#GET values. And default to "" empty string if not given
		user_data = web.input(hostname="",ip="",group="")
		
		#return json text MIME
		web.header('Content-Type', 'application/json')
		
		# ----------------   INSERT  PING COMMAND ----------------------------------
		# -- testvalues to insert
		
		c = cInput()
		#c.ip       = "99.99.99.99"
		#c.hostname = "srv-test-990"
		#c.hostname = "srv-amcweb-b1"
		#c.group    = "Group_99"
		c.ip       = user_data.ip.encode("utf-8")
		c.hostname = user_data.hostname.encode("utf-8")
		c.group    = user_data.group.encode("utf-8")
		insert_ping(c)
		print "[RET]:"+c.returnmessage


		
		json_return = '{"hostname":"'+user_data["hostname"]+'","ip":"'+user_data["ip"]+'","group":"'+user_data["group"]+'","RES":"'+c.returnmessage+'"}'
		return json_return		
		#return '{"Command":"POST","Say":"Test OK!"}'

			
#classname given by tree entry
class configcheck:
	# class simply returns a json
	# --------------------- GET -------------------------------------
	def GET(self):
		#server side allow Cross Origin queries
		web.header('Access-Control-Allow-Origin', '*')
		web.header('Access-Control-Allow-Credentials', 'true')	

        #return json text MIME
		web.header('Content-Type', 'application/json')


        # ----------------   CONFIG CHECKCOMMAND ----------------------------------
		ret = configcheck_prometheus()
		json_return = '{"configcheck":"prometheus","RES":"'+ret+'"}'
		return json_return		
	    
#classname given by tree entry
class reload:
	# class simply returns a json
	# --------------------- GET -------------------------------------
	def GET(self):
		#server side allow Cross Origin queries
		web.header('Access-Control-Allow-Origin', '*')
		web.header('Access-Control-Allow-Credentials', 'true')	

        #return json text MIME
		web.header('Content-Type', 'application/json')


        # ----------------   CONFIG CHECKCOMMAND ----------------------------------
		ret = reload_prometheus()
		json_return = '{"reloadprometheus":"prometheus","RES":"'+ret+'"}'
		return json_return				
 
		
#classname given by tree entry
class pingdelete:
	# class simply returns a json
	# --------------------- GET -------------------------------------
	def GET(self):
		#server side allow Cross Origin queries
		web.header('Access-Control-Allow-Origin', '*')
		web.header('Access-Control-Allow-Credentials', 'true')	

        #GET values. And default to "" empty string if not given
		user_data = web.input(hostname="",ip="",group="")
		
        #return json text MIME
		web.header('Content-Type', 'application/json')


        # ----------------   CONFIG CHECKCOMMAND ----------------------------------
		
		c = cInput()
		#c.ip       = "99.99.99.99"
		#c.hostname = "srv-test-990"
		#c.hostname = "srv-amcweb-b1"
		#c.group    = "Group_99"
		c.ip       = user_data.ip.encode("utf-8")
		c.hostname = user_data.hostname.encode("utf-8")
		c.group    = user_data.group.encode("utf-8")
		delete_ping(c)
		print "[RET]:"+c.returnmessage
		
		
		json_return = '{"hostname":"'+user_data["hostname"]+'","ip":"'+user_data["ip"]+'","group":"'+user_data["group"]+'","RES":"'+c.returnmessage+'"}'
		return json_return			
 
#classname given by tree entry
class createnetdataagent:
	# class simply returns a json
	# --------------------- GET -------------------------------------
	def GET(self):
		#server side allow Cross Origin queries
		web.header('Access-Control-Allow-Origin', '*')
		web.header('Access-Control-Allow-Credentials', 'true')	

        #GET values. And default to "" empty string if not given
		user_data = web.input(hostname="",ip="",group="")
		
        #return json text MIME
		web.header('Content-Type', 'application/json')


        # ----------------   CONFIG CHECKCOMMAND ----------------------------------
		
		c = cInput()
		#c.ip       = "99.99.99.99"
		#c.hostname = "srv-test-990"
		#c.hostname = "srv-amcweb-b1"
		#c.group    = "Group_99"
		c.ip       = user_data.ip.encode("utf-8")
		c.hostname = user_data.hostname.encode("utf-8")
		c.group    = user_data.group.encode("utf-8")
		insert_linux_netdata_agent(c)
		print "[RET]:"+c.returnmessage
		
		
		json_return = '{"hostname":"'+user_data["hostname"]+'","ip":"'+user_data["ip"]+'","group":"'+user_data["group"]+'","RES":"'+c.returnmessage+'"}'
		return json_return

#classname given by tree entry
class deletenetdataagent:
	# class simply returns a json
	# --------------------- GET -------------------------------------
	def GET(self):
		#server side allow Cross Origin queries
		web.header('Access-Control-Allow-Origin', '*')
		web.header('Access-Control-Allow-Credentials', 'true')	

        #GET values. And default to "" empty string if not given
		user_data = web.input(hostname="",ip="",group="")
		
        #return json text MIME
		web.header('Content-Type', 'application/json')


        # ----------------   CONFIG CHECKCOMMAND ----------------------------------
		
		c = cInput()
		#c.ip       = "99.99.99.99"
		#c.hostname = "srv-test-990"
		#c.hostname = "srv-amcweb-b1"
		#c.group    = "Group_99"
		c.ip       = user_data.ip.encode("utf-8")
		c.hostname = user_data.hostname.encode("utf-8")
		c.group    = user_data.group.encode("utf-8")
		#delete_ping(c)
		delete_linux_netdata_agent(c)
		print "[RET]:"+c.returnmessage
		
		
		json_return = '{"hostname":"'+user_data["hostname"]+'","ip":"'+user_data["ip"]+'","group":"'+user_data["group"]+'","RES":"'+c.returnmessage+'"}'
		return json_return	 

#classname given by tree entry
class createwmiagent:
	# class simply returns a json
	# --------------------- GET -------------------------------------
	def GET(self):
		#server side allow Cross Origin queries
		web.header('Access-Control-Allow-Origin', '*')
		web.header('Access-Control-Allow-Credentials', 'true')	

        #GET values. And default to "" empty string if not given
		user_data = web.input(hostname="",ip="",group="")
		
        #return json text MIME
		web.header('Content-Type', 'application/json')


        # ----------------   CONFIG CHECKCOMMAND ----------------------------------
		
		c = cInput()
		#c.ip       = "99.99.99.99"
		#c.hostname = "srv-test-990"
		#c.hostname = "srv-amcweb-b1"
		#c.group    = "Group_99"
		c.ip       = user_data.ip.encode("utf-8")
		c.hostname = user_data.hostname.encode("utf-8")
		c.group    = user_data.group.encode("utf-8")
		insert_windows_wmi_agent(c)
		print "[RET]:"+c.returnmessage
		
		
		json_return = '{"hostname":"'+user_data["hostname"]+'","ip":"'+user_data["ip"]+'","group":"'+user_data["group"]+'","RES":"'+c.returnmessage+'"}'
		return json_return
		
#classname given by tree entry
class deletewmiagent:
	# class simply returns a json
	# --------------------- GET -------------------------------------
	def GET(self):
		#server side allow Cross Origin queries
		web.header('Access-Control-Allow-Origin', '*')
		web.header('Access-Control-Allow-Credentials', 'true')	

        #GET values. And default to "" empty string if not given
		user_data = web.input(hostname="",ip="",group="")
		
        #return json text MIME
		web.header('Content-Type', 'application/json')


        # ----------------   CONFIG CHECKCOMMAND ----------------------------------
		
		c = cInput()
		#c.ip       = "99.99.99.99"
		#c.hostname = "srv-test-990"
		#c.hostname = "srv-amcweb-b1"
		#c.group    = "Group_99"
		c.ip       = user_data.ip.encode("utf-8")
		c.hostname = user_data.hostname.encode("utf-8")
		c.group    = user_data.group.encode("utf-8")
		#delete_ping(c)
		delete_windows_wmi_agent(c)
		print "[RET]:"+c.returnmessage
		
		
		json_return = '{"hostname":"'+user_data["hostname"]+'","ip":"'+user_data["ip"]+'","group":"'+user_data["group"]+'","RES":"'+c.returnmessage+'"}'
		return json_return	  
	
if __name__ == "__main__":
	simulate = False
	if simulate:
		#Test class
		#a = index()		
		#print c.file_lines
		#print a.convert_array_to_big_jsonstring(c.file_lines)
		print "simulate standalone mode"	
				
	else:
		#Start Webservice
		app = web.application(urls, globals())
		#change port via: python app.py 8081
		app.run()		
