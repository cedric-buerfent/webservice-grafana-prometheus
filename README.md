# webservice-grafana-prometheus

Small documentation. Start 6/1/2020 CB

Grafana has one drawback: we cannot easily add hosts and services!

So we present here a  "bridge":
Using python together with the python libraries web.py and yaml, we can access prometheus.yml file via a webservice: 
And tadaaaa: we can now: add hosts, add services, checking and reloading configs etc.

## Command Examples:

- Add Ping
- Check Config
- Apply Config
- Delete Ping
- Test Webservice
- Create Linux Netdata Agent
- Delete Linux Netdata Agent
- Create Windows WMI Agent
- Delete Windows WMI Agent
- ....

## Webservice commands:

- http://172.24.9.58:9091/ping?hostname=srv-test3&ip=99.99.99.99&group=Group-Test1
- http://172.24.9.58:9091/configcheck
- http://172.24.9.58:9091/reload
- http://172.24.9.58:9091/pingdelete?hostname=srv-test3&ip=99.99.99.99&group=Group-Test1
- http://172.24.9.58:9091/test/index.html
- http://172.24.9.58:9091/createnetdataagent?ip=127.0.0.1&hostname=netdatatest&group=Group_TEST
- http://172.24.9.58:9091/deletenetdataagent?ip=127.0.0.1&hostname=netdatatest&group=Group_TEST
- http://172.24.9.58:9091/createwmiagent?ip=127.0.0.1&hostname=wmitest&group=Group_TEST
- http://172.24.9.58:9091/deletewmiagent?ip=127.0.0.1&hostname=wmitest&group=Group_TEST
- ....

See Excel for API details and examples: API_prometheus-grafana.xlsx  (regularly updated) [local changed]


