def hexGen(colors):
    hexFile = open("hexFile.txt", 'w')
    hexFile.write("[")
    for i in range(len(colors)):
        hexFile.write('"#%s", ' % colors[i])
    for i in range(len(colors)-1,0,-1):
        hexFile.write('"#%s", ' % colors[i])
    hexFile.write("]")

def makeHex(r,g,b,colors):
    r = hex(r)[2:]
    g = hex(g)[2:]
    b = hex(b)[2:]

    if len(r) < 2:
        r = '0' + str(r)
    if len(g) < 2:
        g = '0' + str(g)
    if len(b) < 2:
        b = '0' + str(b)

    hexa = r + g + b
    colors.append(hexa)

    return colors

def main():
    r = 100
    g = 0
    b = 0
    colors = []
    #red
    for i in range(150):
        r+=1
        makeHex(r,g,b,colors)
    #red and green
    for i in range(250):
        g+=1
        makeHex(r,g,b,colors)
    #blue and green
    for i in range(250):
        r-=1
        b+=1
        makeHex(r,g,b,colors)
    #red and blue
    for i in range(250):
        g-=1
        r+=1
        makeHex(r,g,b,colors)
    #blue
    for i in range(250):
        r-=1
        makeHex(r,g,b,colors)
    #green
    for i in range(250):
        g+=1
        b-=1
        makeHex(r,g,b,colors)
    #red
    for i in range(250):
        g-=1
        r+=1
        makeHex(r,g,b,colors)

    hexGen(colors)

main()
