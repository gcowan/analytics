from pylab import *
from scipy import *
import csv

x = []
y = []
color = []
area = []

areas = {}

# reading the data from a csv file
filename = 'Recorded_Crime_volumes_v0.1_Final.csv'
with open( filename, 'r' ) as csvfile:
        reader = csv.reader(csvfile, delimiter=',')
        count = 0
        for row in reader:
            if count == 0:
                count += 1
                continue
            area = row[1].split(":")[1]
            if area not in areas: crimes = {}
            crime = (row[1].split(":")[0]).split("\x96")[-1]
            values = [ int(r) for r in row[2:6]]
            crimes[crime] = values
            areas[area] = crimes

labels = ['2008', '2009', '2010', '2011']
val_x = [[], [], [], []]
val_y = [[], [], [], []]
val_z = [[], [], [], []]
colors = 'rgbc'
area_names = []
for area, crimes in areas.items():
    if "Citywide" in area: continue
    area_names.append(area.lstrip(' '))
    for crime, values in crimes.items():
        if "all crimes" in crime:
            for i in range(len(values)):
                val_z[i].append(values[i])
        if "violence" in crime:
            for i in range(len(values)):
                val_x[i].append(values[i])
        if "crimes involving dishonesty" in crime:
            for i in range(len(values)):
                val_y[i].append(values[i])

print area_names
print val_x
print val_y
print val_z
print

ind = np.arange(len(area_names))

width = 0.2
plot, ax = subplots()
color_index = 0
for i in range(len(val_z)):
    ax.bar(ind+i*width, val_z[i], width, color=colors[color_index])
    ax.set_xticks(ind+width)
    color_index += 1

ax.set_ylabel('Number of reported crimes')
ax.set_xticklabels(area_names, rotation=90)
handles, lab = ax.get_legend_handles_labels()
ax.legend(handles, labels, loc='upper right')
ax.grid()

plot, ax = subplots()
sct = scatter(val_x[3], val_y[3], c=colors[3], s=val_z[3], linewidths=2, edgecolor='w')
#sct = scatter(val_x, val_y, c=colors, s=val_z, linewidths=2, edgecolor='w')
sct.set_alpha(0.75)
ax.set_ylabel('Number of reported crimes involving dishonesty')
ax.set_xlabel('Number of reported crimes violence')

for i in range(len(val_x[0])):
    text(val_x[3][i], val_y[3][i], area_names[i],size=11,horizontalalignment='center')

show()
