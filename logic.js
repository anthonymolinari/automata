
class automaton {
    constructor(name) {
        this.autoName = name,
        this.listOfNodes = []
        this.transitionValues = []
        this.regularExpression = ""

        //This will decide if the automaton is a
        // DFA, NFA or R.E.
        //0: Unknown (Default start state)
        //1: DFA
        //2: NFA
        this.automatonType = 0
    }

    //Tells if the Automaton is a DFA or NFA 
    //  (Only needed for when simplification occurs)
    determineState() {
        for (let iter = 0; iter < this.transitionValues.length; iter++) {
            if (this.transitionValues[iter][1] > this.listOfNodes.length) {
                this.automatonType = 2
                return
            }
        }
        this.automatonType = 1
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

    //Keeps track of all of the paramemters used
    //opFlag codes:
    //1, check to add
    //2, check to remove
    updateTransitionValues(parameter, opFlag) {
        switch(opFlag) {
            //Check if the parameter is already there, if not then add
            case 1:
                for (let iter = 0; iter < this.transitionValues.length; iter++) {
                    if (parameter === this.transitionValues[iter][0]) {
                        this.transitionValues[iter][1]++
                        return
                    }
                }
                this.transitionValues.push([parameter, 1])
                break
            //Checks if the parameter is there, if it is then remove
            case 2:
                for (let iter = 0; iter < this.transitionValues.length; iter++) {
                    if (parameter === this.transitionValues[iter][0]) {
                        if (this.transitionValues[iter][1] > 1) {
                            this.transitionValues[iter][1]--
                        }
                        else {
                            this.transitionValues.splice(iter, 1)
                        }
                    }
                }
                break
        }
    }

    //Adding a node is simple because of how easy it is to remove a node
    addNode(xPos, yPos) {
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
        //Default the node to Non-terminal
        this.listOfNodes.push(new node(xPos, yPos, nodeId, 0))
    }

    //Update the nodes identity
    updateIdentity(nodeId, nodeIden) {
        this.listOfNodes[nodeId].identity = nodeIden
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
            this.updateTransitionValues(command[2], 2)
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
            this.updateTransitionValues(command[2], 2)
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
                //Create the rule for the node to be added
                this.listOfNodes[origin].makeRule(command)
                if (origin != destination) {
                    //Create any linked rules from other nodes pointing to this node
                    this.listOfNodes[destination].makeLinkedRule(command)
                }

                //Perform book keeping
                this.updateTransitionValues(parameter, 1)
                this.determineState()
                break
            case 2:
                //Clear the rules out of the node to be removed
                this.listOfNodes[origin].removeRule(command)
                if (origin != destination) {
                    //Clear any linked rules from other nodes pointing to this node
                    this.listOfNodes[destination].removeLinkedRule(command)
                }

                //Perform book keeping
                this.updateTransitionValues(parameter, 2)
                this.determineState()
                break
            case 3:
                console.log(command)
                break
        }
    }

    buildTable() {
        //First, construct a table for which to determine which nodes to simplify
        //Example table setup
        // -   -  'a' 'b' 
        // S   0   0   1
        // G   1   1   0
        //First two slots are reserved for node number and identifier
        //After that, the destination of each statement and the parameter
        //  are the only important pieces of information, since everything
        //  will iterate downwards to populate the table
        //This for loop gets the number of unique parameters that exist
        let uniqueParams = []
        for (let iter = 0; iter < this.transitionValues.length; iter++) {
            uniqueParams[iter] = this.transitionValues[iter][0]
        }

        if (uniqueParams.length < 2) {
            console.log("Cannot simplify, too few nodes")
            //The -1 is an error code for failed
            return -1
        }

        let transitionTable = []
        // creating two-dimensional array for future use
        //This sets up the array in the proper rotation, do not change
        for (let iter = 0; iter < this.listOfNodes.length + 1; iter++) {
            transitionTable[iter] = [];
            for (let innerIter = 0; innerIter < uniqueParams.length + 2; innerIter++) {
                transitionTable[iter][innerIter] = -1;
            }
        }
        
        //This part builds the first row, since no access calls need to be made outside this function
        transitionTable[0][0] = '-'
        transitionTable[0][1] = '-'
        for (let iter = 0; iter < uniqueParams.length; iter++) { transitionTable[0][iter + 2] = uniqueParams[iter]}

        //Build the remaining lines
        for (let iter = 0; iter < this.listOfNodes.length; iter++) {
            //Update the array to show if the node is a Goal node, Non-Terminal node or a Start node
            switch (this.listOfNodes[iter].identity) {
                case 0:
                    transitionTable[iter + 1][0] = 'T'
                    break
                case 1:
                    transitionTable[iter + 1][0] = 'S'
                    break
                case 2:
                    transitionTable[iter + 1][0] = 'G'
                    break
            }

            //Update the array to show which node is currently being explored
            transitionTable[iter + 1][1] = this.listOfNodes[iter].nodeID

            //Update the array to show the transitions on each parameter
            for (let innerIter = 0; innerIter < this.listOfNodes[iter].rules.length; innerIter++) {
                let command = this.statementParser(this.listOfNodes[iter].rules[innerIter])
                for (let arrIdx = 2; arrIdx < transitionTable[0].length; arrIdx++) {
                    if (transitionTable[0][arrIdx] === command[2]) {
                        transitionTable[iter + 1][arrIdx] = command[1]
                    }
                }
            }
        }

        return transitionTable
    }

    //There is almost certainly a MUCH better solution to this
    //  but I have no idea, currently O(n^3) but might be reducible
    //  to O(n^2) or lower
    simplifyDFA() {
        //Check if the Automaton is a DFA
        if (this.automatonType != 1) {
            console.log("Error: DFA not detected")
            return;            
        }

        let table = this.buildTable()
        let tableLocation = []
        let equalNodes = []

        //Find the location of all the nodes (Might not be needed)
        for (let iter = 1; iter < table.length; iter++) {
            tableLocation.push([table[iter][1], table[iter][0]])
        }

        for (let iter = 1; iter < table.length; iter++) {            
            //Check all nodes below the current node to see if any are equivalent
            for (let innerIter = iter + 1; innerIter < table.length; innerIter++) {
                //If equivalence becomes equal to the length of possible transitions,
                //  then the nodes are equal
                let equivalence = 0;
                for (let arrIdx = 2; arrIdx < table[innerIter].length; arrIdx++) {
                    let valueOne = parseInt(table[iter][arrIdx])
                    let valueTwo = parseInt(table[innerIter][arrIdx])
                    if (valueOne === -1 || valueTwo === -1) {
                        //Do nothing unless both are equal to -1
                        if (valueOne === valueTwo) {
                            equivalence++
                        }
                    }
                    else {
                        let tableValOne = -1, tableValTwo = -1, flag = 0
                        for (let arrIdx = 0; arrIdx < tableLocation.length; arrIdx++) {
                            if (tableLocation[arrIdx][0] === valueOne && flag != 2) {
                                tableValOne = tableLocation[arrIdx][1]
                                if (flag === 1) { break }
                                flag = 2
                            }
                            else if (tableLocation[arrIdx][0] === valueTwo && flag != 1) {
                                tableValTwo = tableLocation[arrIdx][1]
                                if (flag === 2) { break }
                                flag = 1
                            }
                        }

                        //Fix logic here for second running
                        if ((tableValOne === tableValTwo) || (tableValOne === 'S' && tableValTwo === 'T') 
                        || (tableValOne === 'T' && tableValTwo === 'S')) {
                            equivalence++
                        }   
                    }
                }
                if (equivalence === this.transitionValues.length) {
                    //DEBUG printout
                    //console.log("Equivalent nodes: ", iter - 1, " and ", innerIter - 1)
                    //iter will be updated while innerIter will be removed
                    equalNodes.push([iter - 1, innerIter - 1])
                }
            }
        }

        //Call helper function to perform the deletes and updates
        //  This also helps to make the code more readable since it's one large
        //  blocks broken up into two functions
        if (equalNodes.length > 0) {
            this.simplifyDFAHelper(equalNodes) 
            //Simplification has occured
            return 0
        }
        else {
            //There is no more possible simplification
            return -1 
        }
    }

    simplifyDFAHelper(nodeGroups) {
        let rules = []

        for (let iter = 0; iter < nodeGroups.length; iter++) {
            //check if the node that would be removed is actually the Start node
            //  If it is, then swap the nodes before the rest of the logic
            if (this.listOfNodes[nodeGroups[iter][1]].identity === 1) {
                let temp = nodeGroups[iter][0];
                nodeGroups[iter][0] = nodeGroups[iter][1]
                nodeGroups[iter][1] = temp
            }

            //Get the rules of the node to be updated
            let rulesSize = this.listOfNodes[nodeGroups[iter][0]].rules.length
            for (let innerIter = 0, leftShift = 0; innerIter < rulesSize; innerIter++, leftShift--) {
                let command = this.statementParser(this.listOfNodes[nodeGroups[iter][0]].rules[innerIter + leftShift])

                //Check if the statement points to the node that is going
                // to be removed
                this.updateLink(command[0], command[1], command[2], 2)
                if (parseInt(command[1]) === nodeGroups[iter][1]) {
                    //If so, make the command a looping statement
                    command[1] = command[0]
                }

                //Save the command for later user
                rules.push([command[0],command[1], command[2]])
            }

            //Update the rules of the non-removed node
            for (let innerIter = 0; innerIter < rules.length; innerIter++) {
                this.updateLink(rules[innerIter][0], rules[innerIter][1], rules[innerIter][2], 1)
            }

            //Clear out rules for the next repeat
            rules = []
        }

        //Remove any invalid statements from linkedRules
        //leftShift is used to stay at the proper location within the array
        for (let iter = 0; iter < nodeGroups.length; iter++) {
            let linkedRulesSize = this.listOfNodes[nodeGroups[iter][0]].linkedRules.length
            for (let innerIter = 0, leftShift = 0; innerIter < linkedRulesSize; innerIter++) {
                let command = this.statementParser(this.listOfNodes[nodeGroups[iter][0]].linkedRules[innerIter + leftShift])

                if (parseInt(command[0]) === nodeGroups[iter][1]) {
                    this.listOfNodes[nodeGroups[iter][0]].removeLinkedRule(`{${parseInt(command[0])},${parseInt(command[1])},${command[2]}}`)
                    leftShift--
                }
            }
        }

        //Remove the equivalent nodes
        let leftShift = 0
        for (let iter = 0; iter < nodeGroups.length; iter++) {
            //This will miss linkedRules removals, but that that can be ignored
            this.removeNode(nodeGroups[iter][1] - leftShift)

            //Check if the next nodeID is greater than the
            //  length of listOfNodes, in which case you need to
            //  minus that nodeID by leftShift to be in the
            //  proper place for removeNode to function correctly
            if (nodeGroups[iter][1] < this.listOfNodes.length) {
                leftShift++
            }
        }


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
        //check if the statement already exists
        for (let iter = 0; iter < this.rules.length; iter++) {
            if (statement === this.rules[iter]) {
                return
            }
        }
        this.rules.push(statement)
    }

    makeLinkedRule(statement) {
        //check if the statement already exists
        for (let iter = 0; iter < this.linkedRules.length; iter++) {
            if (statement === this.linkedRules[iter]) {
                return
            }
        }
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
        //console.log("Error, statement not found!")

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
        //console.log("Error, statement not found!")
    }
}

//Testing
const autoOne = new automaton("Test 1") //Dummy Name

//Builds a dummy DFA (Use later for testing DFA - simplification for conversion post R.E conversion (Maybe))
/*
autoOne.addNode(1, 17.25, 84.7)
autoOne.updateLink(0, 0, 'b', 1)
autoOne.addNode(0, 40.25, 55.7)
autoOne.updateLink(0, 1, 'a', 1)
autoOne.updateLink(1, 1, 'b', 1)
autoOne.addNode(2, 90.25, 13.7)
autoOne.updateLink(1, 2, 'a', 1)
autoOne.updateLink(2, 2, 'a', 1)
autoOne.updateLink(2, 2, 'b', 1)
*/


//Test DFA structure (its also an NFA by virtue)
// ->0 <--> 1
//   |      |
//  *2 <-> *3
//Create the top nodes
autoOne.addNode(13, 17)
autoOne.updateIdentity(0, 1)
autoOne.addNode(33, 17)
//Link them together
autoOne.updateLink(0, 1, 'a', 1)
autoOne.updateLink(1, 0, 'a', 1)
//create the bottom nodes
autoOne.addNode(13, 37)
autoOne.updateIdentity(2, 2)
autoOne.addNode(33, 37)
autoOne.updateIdentity(3, 2)
//Link the bottom nodes together
autoOne.updateLink(2, 2, 'b', 1)
autoOne.updateLink(3, 3, 'b', 1)
autoOne.updateLink(3, 2, 'a', 1)
autoOne.updateLink(2, 3, 'a', 1)
//Link the top nodes to the bottom nodes
autoOne.updateLink(0, 2, 'b', 1)
autoOne.updateLink(1, 3, 'b', 1)


/*
//Testing adding and removing a link 
// (Updated the logic to keep track of the transtion count)
autoOne.addNode(1, 77, 44)
autoOne.addNode(2, 44, 77)
autoOne.updateLink(0, 0, 'b', 1)
autoOne.updateLink(0, 1, 'a', 1)
autoOne.updateLink(1, 1, 'a', 1)
autoOne.updateLink(1, 0, 'b', 1)
//console.log(autoOne.transitionValues[0], " , " ,autoOne.transitionValues[1])
//autoOne.removeNode(1)
//console.log(autoOne.transitionValues[0], " , " ,autoOne.transitionValues[1])
*/

/*
//Internal call to build a DFA Table
let table = autoOne.buildTable()

//printout for DEBUG only
for (let i = 0; i < table.length; i++) {
    console.log(table[i])
}
*/

/*
//check if the Automaton is updating between being a NFA or DFA
console.log(autoOne.automatonType)
autoOne.updateLink(0, 2, 'a', 1)
console.log(autoOne.automatonType)
autoOne.updateLink(0, 2, 'a', 2)
console.log(autoOne.automatonType)
*/


//Simplification does not re-link from other affected nodes
//This is what the command would look like for executing
//  DFA - Simplification
//===========================
let tempVal = autoOne.simplifyDFA()
while (tempVal != -1) {
    tempVal = autoOne.simplifyDFA()
}

if (tempVal === -1) {
    console.log("No more simplification possible!")
}
//===========================

//Recall buildTable to check if the DFA was simplified
let table = autoOne.buildTable()

//printout for DEBUG only
for (let i = 0; i < table.length; i++) {
    console.log(table[i])
}

/*
for (let i = 0; i < autoOne.transitionValues.length; i++ ) { 
    console.log(autoOne.transitionValues[i])
}
*/


//Checks if removeNode works
//autoOne.removeNode(1)

//Adds a node post removal to ensure that the proper nodeID is being used
//autoOne.addNode(0, 30.77, 70.34)
autoOne.printNodes()
