
class automaton {
    constructor(name) {
        this.autoName = name,
        this.listOfNodes = []
    }

    statementParser(statement) {
        
        //Operation flag tracks if its the origin, 
        //  destination or parameter being read in
        let operationFlag = 0
        //Declare variables
        let origin = 0
        let destination = 0
        let parameter = ""

        for (let iter = 0; iter < statement.length; iter++) {
            if (statement[iter] != "{" && statement[iter] != "}" && statement[iter] != "," && statement[iter] != " ") {
                switch(operationFlag) {
                    case 0:
                        origin = statement[iter]
                        operationFlag++
                        break
                    case 1:
                        destination = statement[iter]
                        operationFlag++
                        break
                    case 2:
                        parameter = statement[iter]
                        operationFlag++
                        break
                    default:
                        console.log("Statement Parser Error! operationFlag out of bounds!")                            
                }
            }
        }

        return [origin, destination, parameter]
    }

    //Adding a node is simple because of how easy it is to remove a node
    addNode(nodeIdnt = 0, xPos, yPos) {
        let nodeId = 0
        //Find the next value for nodeId, breaking if after a full run through
        //  there are no more matches
        for (let noUpdate = 0; noUpdate < 2; noUpdate++) {
            for (let iter = 0; iter < this.listOfNodes.length; iter++) {
                if (nodeId === this.listOfNodes[iter].nodeID) {
                    nodeId++
                    noUpdate = 0
                    break
                }
            }
        }
        this.listOfNodes.push(new node(xPos, yPos, nodeId, nodeIdnt))
    }

    //"Deletes" a node by clearing all the data within./lo
    removeNode(nodeID) {
        //Clear out all the statements from linkedRules
        for (let iter = 0; iter < this.listOfNodes[nodeID].linkedRules.length; iter++) {
            //Build an array containing the origin, destination and paramenter of the statement
            let command = this.statementParser(this.listOfNodes[nodeID].linkedRules[iter])
            //console.log(this.listOfNodes[nodeID].linkedRules[iter]) //DEBUG printout

            //Remove the statement from any node linked to this node
            //Check if it's not a self loop statement
            if (command[0] != command[1]) {
                //In Linked Rules, command[0] is the node we want to alter
                this.listOfNodes[command[0]].removeRule(this.listOfNodes[nodeID].linkedRules[iter])
            }
        }

        //Clear out all the statements from Rules
        for (let iter = 0; iter < this.listOfNodes[nodeID].rules.length; iter++) {
            //Build an array containing the origin, destination and paramenter of the statement
            let command = this.statementParser(this.listOfNodes[nodeID].rules[iter])

            //Remove the statement from any node linked to this node
            //Check if it's not a self loop statement
            if (command[0] != command[1]) {
                //In Rules, command[1] is the node we want to alter
                this.listOfNodes[command[1]].removeLinkedRule(this.listOfNodes[nodeID].rules[iter])
            }
        }
        
        //Final action to do
        this.listOfNodes.splice(nodeID, 1);
    }

    //Updates the link between nodes by getting the Origin, the
    //  destination and the parameter before building the
    //  statement.
    //
    //Operation flag is to signify if the following statement is for
    // 1: Adding to the node
    // 2: Removing from the node
    // 3: printing out the statement (DEBUG ONLY)
    updateLink(origin, destination, parameter, operationFlag) {
        let command = `{${origin},${destination},${parameter}}`
        
        switch(operationFlag) {
            case 1:
                this.listOfNodes[origin].makeRule(command)
                if (origin != destination) {
                    this.listOfNodes[destination].makeLinkedRule(command)
                }
                break
            case 2:
                this.listOfNodes[origin].removeRule(command)
                if (origin != destination) {
                    this.listOfNodes[destination].removeLinkedRule(command)
                }
                break
            case 3:
                console.log(command)
                break
        }
    }

    //Not needed, might be deleted at a later date
    /*
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
    */

    //The limit is high, but printing over 10k nodes is 
    // not in the scope of this project
    printNodes(limiter = 9999) {
        for (let iter = 0; (iter < limiter && iter < this.listOfNodes.length); iter++) {
            console.log("====================")
            console.log(`Node ${iter + 1}`)
            console.log("X Pos: ", this.listOfNodes[iter].xPosition, "")
            console.log("Y Pos: ", this.listOfNodes[iter].yPosition, "")
            console.log("nodID: ", this.listOfNodes[iter].nodeID, "")
            console.log("noTpe: ", this.listOfNodes[iter].identity, "")
            console.log("--------------------")
            console.log("Rules: ")
            for (let innerIter = 0; innerIter <  this.listOfNodes[iter].rules.length; innerIter++) {
                console.log(`[${innerIter + 1}]: `, this.listOfNodes[iter].rules[innerIter])
            }
            console.log("--------------------")
            console.log("Linked Rules: ")
            for (let innerIter = 0; innerIter <  this.listOfNodes[iter].linkedRules.length; innerIter++) {
                console.log(`[${innerIter + 1}]: `, this.listOfNodes[iter].linkedRules[innerIter])
            }
        }
        console.log("====================")
    }
}

class node {
    constructor(x, y, id, iden) {
        this.xPosition = x,
        this.yPosition = y,
        //Rules refer to where the node points to and
        //  what transition that occurs on
        this.rules = [],
        //linkedRules refers to the transitions outside of
        //  this node that point to this node
        //
        //In other words, this lets us update the node list to
        //  safely and efficiently remove the links that are
        //  connecting the nodes.
        this.linkedRules = [],
        //id index starts at 0 and goes up
        this.nodeID = id,
        //identity means if the node is either a
        // non-terminal (0), start position (1) or
        // goal node (2)
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

    makeLinkedRule(statement) {
        this.linkedRules.push(statement)
    }

    //Both removes exist for when doing NFA -> R.E. conversion
    removeRule(statement) {
        //For loop for removing the EXACT rule match
        for (let iter = 0; iter < this.rules.length; iter++) {
            if (this.rules[iter] === statement) {
                this.rules.splice(iter, 1)
                return 0
            }
        }
        //Should the statement not be found, this is an error and should be reported
        console.log("Error, statement not found!")

    }

    removeLinkedRule(statement) {
        //For loop for removing the EXACT rule match
        let iter = 0
        for (; iter < this.linkedRules.length; iter++) {
            if (this.linkedRules[iter] === statement) {
                this.linkedRules.splice(iter, 1)
                return 0
            }
        }
        //Should the statement not be found, this is an error and should be reported
        console.log("Error, statement not found!")
    }
}

//Testing
const autoOne = new automaton("Test 1") //Dummy Name

//Builds a dummy DFA (Use later for testing DFA - simplification for conversion post R.E conversion (Maybe))
autoOne.addNode(1, 17.25, 84.7)
autoOne.updateLink(0, 0, 'b', 1)
autoOne.addNode(0, 40.25, 55.7)
autoOne.updateLink(0, 1, 'a', 1)
autoOne.updateLink(1, 1, 'b', 1)
autoOne.addNode(2, 90.25, 13.7)
autoOne.updateLink(1, 2, 'a', 1)
autoOne.updateLink(2, 2, 'a', 1)
autoOne.updateLink(2, 2, 'b', 1)

//Testing adding and removing a link
autoOne.updateLink(0, 2, 'b', 1)
autoOne.updateLink(0, 2, 'b', 2)

//Checks if removeNode works
//autoOne.removeNode(1)

//Adds a node post removal to ensure that the proper nodeID is being used
//autoOne.addNode(0, 30.77, 70.34)
autoOne.printNodes()
