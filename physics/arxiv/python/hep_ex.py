import urllib

def condense( source ):
    s = source.split("\n")
    x={"neutrino": 0, "top":0, "psi": 0, "higgs": 0, "scattering":0, "cp":0, "average":0, "electroweak":0, "dark matter":0, "other":0}
    titles = []
    citations = []
    for i in s:
        if "titlelink" in i:
            titles.append(i)
        if "citations" in i:
            citations.append(i)

    index = 0
    for t in range(len(titles)):
        for key in x.keys():
            if key in t.lower(): x[key] += 1

    total = 0
    for key, value in x.items():
        total += value
    print total, x
    return x

myurl = urllib.urlopen("http://inspirehep.net/info/hep/stats/topcites/2013/eprints/to_hep-ex_alltime.html")
source_all = myurl.read()
myurl = urllib.urlopen("http://inspirehep.net/info/hep/stats/topcites/2013/eprints/to_hep-ex_annual.html")
source_2013 = myurl.read()
x_dict = condense(source_all)
y_dict = condense(source_2013)

x = []
y = []
for name in x_dict.keys():
    x.append(x_dict[name])
    y.append(y_dict[name])

from pylab import *

sct = scatter(x, y)

show()

