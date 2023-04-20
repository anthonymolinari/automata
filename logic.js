
class automaton {
    constructor(name) {
        this.autoName = name,
        this.listOfNodes = []
    }

    addNode(node) {
        this.listOfNodes.push(node)
    }

    removeNode(nodeID) {
        
    }

    returnValidID() {
        for (let iter = 0; iter < this.listOfNodes.length; iter++) {
            if (this.listOfNodes[iter].nodeID === iter) {
                //Do nothing
            }
            else { //There is a missing node
                return iter;
            }
        }
        //If all nodes are accounted for, then simply 
        // return the size for the next input
        return this.listOfNodes.length
    }

    //The limit is high, but printing over 10k nodes is 
    // not in the scope of this project
    printNodes(limiter = 9999) {
        for (let iter = 0; (iter < limiter && iter < this.listOfNodes.length); iter++) {
            console.log("====================")
            console.log(`Node ${iter + 1}`)
            console.log("X Pos: ", this.listOfNodes[iter].xPosition, "")
            console.log("Y Pos: ", this.listOfNodes[iter].yPosition, "")
            console.log("nodID: ", this.listOfNodes[iter].nodeID, "")
            console.log("--------------------")
            console.log("Rules: ")
            for (let innerIter = 0; innerIter <  this.listOfNodes[iter].rules.length; innerIter++) {
                console.log(`[${innerIter + 1}]: `, this.listOfNodes[iter].rules[innerIter])
            }
        }
        console.log("====================")
    }
}

class node {
    constructor(x, y, id, iden) {
        this.xPosition = x,
        this.yPosition = y,
        this.rules = [],
        //id index starts at 0 and goes up
        this.nodeID = id,
        //identity means if the node is either a
        // non-terminal, start position or
        // goal node
        this.identity = iden
    }

    //The validity check should be inherent to the
    // structure of the automaton itself, since the
    // automaton should always be properly build
    // (This doesn't mean correct!)
    makeRule(statement) {
        //Example statements:
        // {0, 1, a}
        // {0, 0, b}
        this.rules.push(statement)
    }
}

//Test variables
let size = 3
let size2 = 1
const autoOne = new automaton("Test 1") //Dummy Name
let x = 0
let y = 0


//Build out each node and add them to the automaton
for (let iter = 0; iter < size; iter++) {
    //There would be a read in for and x and y variable
    const tempNode = new node(x + iter, y + iter, autoOne.returnValidID())

    //Logic to place the node down

    //Logic to save all the rules per node
    let origin = iter
    let destination = iter
    let label = iter
    for (let innerIter = 0; innerIter < size2; innerIter++) {
        tempNode.makeRule(`{${origin},${destination},${label}}`)
    }
    autoOne.addNode(tempNode)   
}

autoOne.printNodes()
