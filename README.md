# webservice-grafana-prometheus

Small documentation. Start 6/1/2020 CB

Grafana has one drawback: we cannot easily add hosts and services!

So we present here a  "bridge":
Using python together with the python libraries web.py and yaml, we can access prometheus.yml file via a webservice: 
And tadaaaa: we can now: add hosts, add services, checking and reloading configs etc.
