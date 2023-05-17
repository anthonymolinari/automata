class automaton {
    constructor(name) {
        //Name of the automaton
        this.autoName = name
        //Contains all the nodes of the automation
        this.listOfNodes = []
        //The copy exists due to using the 
        //   State Elimination method for RE generation
        this.copyOfListOfNodes = []
        //Transition Values is used as a cheap way to tell if
        //   the automaton is a DFA or an NFA
        this.transitionValues = []
        //Contains a list of all the unique rules for
        //  simplifying the building of the edges
        this.connectionList = []
        //The copy exists due to using the 
        //   State Elimination method for RE generation
        //   and being used for generation of the SVG image
        this.connectionListCopy = []
        //This is where the regular expression will go
        this.regularExpression = ""
        //This will decide if the automaton is a
        // DFA or NFA
        //0: Unknown (Default start state)
        //1: DFA
        //2: NFA
        this.automatonType = 0
    }

    //Direct access to regularExpression
    setRegularExpression(RE) {
        this.regularExpression = RE
    }

    //Test if a string is valid for the DFA
    testMembershipDFA(stringToTest) {
        let parseString = stringToTest
        let currIdx = 0

        //Find the starting address
        for (let iter = 0; iter < this.listOfNodes.length; iter++) {
            if  (this.listOfNodes[iter].identity === 1) {
                currIdx = iter
                break
            }
        }

        //Run through the string, following the path through the DFA
        while (parseString.length > 0) {
            for (let iter = 0; iter < this.listOfNodes[currIdx].rules.length; iter++) {
                let command = this.statementParser(this.listOfNodes[currIdx].rules[iter])
                if (command[2] === parseString.substr(0, 1)) {
                    for (let innerIter = 0; innerIter < this.listOfNodes.length; innerIter++) {
                        if  (this.listOfNodes[innerIter].nodeID === parseInt(command[1])) {
                            currIdx = innerIter
                            break
                        }
                    }
                    break
                }
            }
            parseString = parseString.substr(1, parseString.length - 1)
        }

        //Check if the string ended on a goal node
        if (this.listOfNodes[currIdx].identity === 2) {
            return 0
        }
        //Return -1 if no goal node is reached
        return -1
    }

    //Test if a string is valid for the NFA
    testMembershipNFA(stringToTest) {
        let parseString = stringToTest
        let currIdx = 0
        let nextIdx = 0
        let result = 1
        let moreIdx = []

        //Find the starting address
        for (let iter = 0; iter < this.listOfNodes.length; iter++) {
            if  (this.listOfNodes[iter].identity === 1) {
                currIdx = iter
                break
            }
        }

         //Run through the string, following the path through the NFA
         while (parseString.length > 0) {
            for (let iter = 0; iter < this.listOfNodes[currIdx].rules.length; iter++) {
                let command = this.statementParser(this.listOfNodes[currIdx].rules[iter])
                let paths = 0
                if (command[2] === parseString.substr(0, 1)) {
                    for (let innerIter = 0; innerIter < this.listOfNodes.length; innerIter++) {
                        if  (this.listOfNodes[innerIter].nodeID === parseInt(command[1]) && paths < 1) {
                            nextIdx = innerIter
                            paths++
                        }
                        else if (this.listOfNodes[innerIter].nodeID === parseInt(command[1])) {
                            moreIdx.push(currIdx)
                        }
                    }
                }
                else if (command[2] === "E") {
                    moreIdx.push(currIdx)
                    paths++
                }
            }
            parseString = parseString.substr(1, parseString.length - 1)
            currIdx = nextIdx

            if (moreIdx.length > 0) {
                for (let iter = 0; iter < moreIdx.length; iter++) {
                    result = this.testMembershipNFARecursiveHelper(stringToTest, moreIdx[iter])
                }
                moreIdx = []
            }
        }

        //Check if the string ended on a goal node
        if (this.listOfNodes[currIdx].identity === 2 || result === 0) {
            return 0
        }
        //Return -1 if no goal node is reached
        return -1

    }

    testMembershipNFARecursiveHelper(stringToTest, nodeIdx) {
        let parseString = stringToTest
        let currIdx = nodeIdx
        let result = 1
        let moreIdx = []

        //Run through the string, following the path through the NFA
        while (parseString.length > 0) {
            for (let iter = 0; iter < this.listOfNodes[currIdx].rules.length; iter++) {
                let command = this.statementParser(this.listOfNodes[currIdx].rules[iter])
                let paths = 0
                if (command[2] === parseString.substr(0, 1)) {
                    for (let innerIter = 0; innerIter < this.listOfNodes.length; innerIter++) {
                        if  (this.listOfNodes[innerIter].nodeID === parseInt(command[1]) && paths < 1) {
                            currIdx = innerIter
                            paths++
                        }
                        else if (this.listOfNodes[innerIter].nodeID === parseInt(command[1])) {
                            moreIdx.push(currIdx)
                        }
                    }
                }
                else if (command[2] === "E") {
                    moreIdx.push(currIdx)
                    paths++
                }
            }
            parseString = parseString.substr(1, parseString.length - 1)

            if (moreIdx.length > 0) {
                for (let iter = 0; iter < moreIdx.length; iter++) {
                    //Check all other potential paths if there were more than one options
                    //By virtue, we don't have to worry about loops
                    result = this.testMembershipNFARecursiveHelper(stringToTest, moreIdx[iter])
                }
                moreIdx = []
            }
        }

        //Check if the string ended on a goal node
        if (this.listOfNodes[currIdx].identity === 2 || result === 0) {
            return 0
        }
        //Return -1 if no goal node is reached
        return -1
    }

    //Test if a string is valid for the Regular Expression
    testMembershipRE(stringToTest) {
        let parseString = stringToTest
        let expression = this.regularExpression
        let start = 0
        let tempVal = 0

        while (start < expression.length) {
            //Set up as the value and if it repeats.
            //Repeating blocks will be denoted with a 2 while
            //   repeating parameters will be denoted with a 1
            //   choices will be shown with a 3 while repeating
            //   choices will have a 4 instead
            //Example:
            // ['a', 1]  Repeats on itself
            // ['b', 0]  Once
            // ['a', 2]  Repeating the string 'ab', should always
            // ['b', 2]    be next to each other
            let expressionValues = []
            let braceStart = []
            for (let end = start; end < expression.length; end++) {
                //console.log(expression[end])
                if (expression[end] === "(") {
                    braceStart.push(expressionValues.length)
                }
                else if (expression[end] === ")") {
                    if (expression[end + 1] === "*") {
                        end++
                        for (let iter = braceStart.pop(); iter < expressionValues.length; iter++) {
                            if (expressionValues[iter][1] === 3) {
                                expressionValues[iter][1] = 4
                            }
                            else {
                                expressionValues[iter][1] = 2
                            }
                        }
                    }   
                    else {
                        braceStart.pop()
                    }

                    if (end + 1 >= expression.length) {
                        tempVal = end
                    }
                }
                else if (expression[end] === "*") {
                    let temp = expressionValues.pop()
                    temp[1] = 1
                    expressionValues.push(temp)
                    if (end + 1 >= expression.length) {
                        tempVal = end
                    }
                }
                else if (expression[end] === ".") {
                    tempVal = end
                    break
                }
                else if (expression[end] === "U") {
                    let temp = expressionValues.pop()
                    temp[1] = 3
                    expressionValues.push(temp)
                    expressionValues.push([expression[end + 1], 3])
                    end++
                }
                else {
                    expressionValues.push([expression[end], 0])
                }
            }

            for (let iter = 0; iter <= parseString.length;) {
                if (expressionValues.length === 0) { 
                    parseString = parseString.substr(iter, parseString.length - 1)
                    break 
                }
                let reader = expressionValues.shift()
                //Only read in once
                if (reader[1] === 0) {
                    if (parseString[iter] != reader[0]) {
                        return -1
                    }
                    iter++
                }
                //Kleen star was found (This means 0 or more can exist)
                else if (reader[1] === 1) {
                    while (parseString[iter] === reader[0]) { iter++}
                }
                //Kleen star with parenthenses was found
                else if (reader[1] === 2) {
                    let section = []
                    section.push(reader[0])
                    do {
                        reader = expressionValues.shift()
                        section.push(reader[0])
                    } while (expressionValues[0][1] === 2)

                    //Check if each repeating piece does indeed match completely
                    let matching = 0
                    for (let innerIter = 0; true ; innerIter++) {
                        if (iter === parseString.length) {
                            break
                        }

                        if (innerIter >= section.length) {
                            if (matching === section.length) {
                                iter += innerIter
                            }
                            else {
                                break
                            }
                            innerIter = 0
                        }
                        if (parseString[iter] === section[innerIter]) {
                            matching++
                        }
                    }
                }
                //There exist multiple paths that can be taken
                else if (reader[1] === 3) {
                    let section = []
                    section.push(reader[0])
                    do {
                        reader = expressionValues.shift()
                        section.push(reader[0])
                    } while (expressionValues[0][1] === 3)

                    for (let innerIter = 0; innerIter < section.length ; innerIter++) {
                        if (parseString[iter] === section[innerIter]) {
                            iter++
                            break
                        }
                    }
                    //Fail if no paths can be taken
                    return -1
                }
                //There exist multiple paths that can be taken
                //  and these paths are repeating
                else if (reader[1] === 4) {
                    let section = []
                    section.push(reader[0])
                    do {
                        reader = expressionValues.shift()
                        section.push(reader[0])
                        if (expressionValues.length === 0) { break }
                    } while (expressionValues[0][1] === 4)

                    //Check if each repeating piece does indeed match completely
                    let matching = 0
                    for (let innerIter = 0; true ; innerIter++) {
                        if (iter === parseString.length) {
                            break
                        }

                        if (innerIter >= section.length) {
                            if (matching > 0) {
                                iter++
                                
                            }
                            else {
                                break
                            }
                            innerIter = 0
                        }
                        if (parseString[iter] === section[innerIter] && matching === 0) {
                            matching++
                        }
                    }
                }  
            }

            //Skips the concatonation and sets up 
            //  start on the next non-concat value
            start = tempVal + 1
        }

        return 0
    }

    //Builds up connectionList, which is used to build the edges in
    //  a SVG image
    buildConnection(origin, destination, parameter) {
        for (let iter = 0; iter < this.connectionList.length; iter++) {
            if (this.connectionList[iter].origin === origin && 
                this.connectionList[iter].destination === destination && 
                this.connectionList[iter].parameter === parameter) {
                //If the new connection isn't going to be unique. don't add
                return
            }
        }

        let connection = {
            origin,
            destination,
            parameter
        }
        this.connectionList.push(connection)
    }

    //Removes a connection from connectionList, is called by any 
    //  function that involves removing nodes in some capacity
    removeConnection(origin, destination, parameter) {
        for (let iter = 0; iter < this.connectionList.length; iter++) {
            if (this.connectionList[iter].origin === origin && 
                this.connectionList[iter].destination === destination && 
                this.connectionList[iter].parameter === parameter) {
                this.connectionList.splice(iter , 1)
                break
            }
        }
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

    //Parses a string statement and returns it in an easy to access array
    statementParser(statement) {
        
        //Operation flag tracks if its the origin, 
        //  destination or parameter being read in
        let operationFlag = 0
        //Declare variables
        let origin = 0
        let destination = 0
        let parameter = ""
        let startSlice = 0
        let endSlice = statement.length - 1

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
                        startSlice = iter
                        //substr takes a starting position and the number of chars to
                        //  copy over
                        parameter = statement.substr(5, endSlice - startSlice)
                        iter = endSlice
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
        for(let iter = 0; iter < this.listOfNodes.length; iter++) {
            if (this.listOfNodes[iter].nodeID === nodeId) {
                this.listOfNodes[iter].identity = nodeIden
                break
            }
        }
    }

    //"Deletes" a node by clearing all the data within.
    removeNode(nodeID) {
        //Find the correct index of listOfNodes
        let nodeIdx = 0
        for(let iter = 0; iter < this.listOfNodes.length; iter++) {
            if (this.listOfNodes[iter].nodeID === nodeID) {
                nodeIdx = iter
                break
            }
        }
        //Clear out all the statements from linkedRules
        let size = this.listOfNodes[nodeIdx].linkedRules.length
        for (let iter = 0; iter < size; iter++) {
            //Build an array containing the origin, destination and paramenter of the statement
            let command = this.statementParser(this.listOfNodes[nodeIdx].linkedRules[iter])
            //console.log(this.listOfNodes[nodeID].linkedRules[iter]) //DEBUG printout

            //Remove the statement from any node linked to this node
            //Check if it's not a self loop statement
            if (command[0] != command[1]) {
                //In Linked Rules, command[0] is the node we want to alter
                for(let iter = 0; iter < this.listOfNodes.length; iter++) {
                    if (this.listOfNodes[iter].nodeID === parseInt(command[0])) {
                        this.listOfNodes[iter].removeRule(this.listOfNodes[nodeIdx].linkedRules[iter])
                        this.removeConnection(parseInt(command[0]), parseInt(command[1]), command[2])
                        break
                    }
                }
            }
            this.updateTransitionValues(command[2], 2)
        }

        //Clear out all the statements from Rules
        size = this.listOfNodes[nodeIdx].rules.length
        for (let iter = 0; iter < size; iter++) {
            //Build an array containing the origin, destination and paramenter of the statement
            let command = this.statementParser(this.listOfNodes[nodeIdx].rules[iter])
            this.removeConnection(parseInt(command[0]), parseInt(command[1]), command[2])

            //Remove the statement from any node linked to this node
            //Check if it's not a self loop statement
            if (command[0] != command[1]) {
                //In Rules, command[1] is the node we want to alter
                for(let iter = 0; iter < this.listOfNodes.length; iter++) {
                    if (this.listOfNodes[iter].nodeID === parseInt(command[1])) {
                        this.listOfNodes[iter].removeLinkedRule(this.listOfNodes[nodeIdx].rules[iter])
                        this.listOfNodes[iter].removeRule(this.listOfNodes[nodeIdx].rules[iter])
                        break
                    }
                }
            }
            this.updateTransitionValues(command[2], 2)
        }
        
        //Final action to do
        this.listOfNodes.splice(nodeIdx, 1);
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
                this.buildConnection(origin, destination, parameter)
                //Create the rule for the node to be added
                for(let iter = 0; iter < this.listOfNodes.length; iter++) {
                    if (this.listOfNodes[iter].nodeID === parseInt(origin)) {
                        this.listOfNodes[iter].makeRule(command)
                        break
                    }
                }

                //this.listOfNodes[origin].makeRule(command)
                if (origin != destination) {
                    //Create any linked rules from other nodes pointing to this node
                    for(let iter = 0; iter < this.listOfNodes.length; iter++) {
                        if (this.listOfNodes[iter].nodeID === parseInt(destination)) {
                            this.listOfNodes[iter].makeLinkedRule(command)
                            break
                        }
                    }
                    //this.listOfNodes[destination].makeLinkedRule(command)
                }

                //Perform book keeping
                this.updateTransitionValues(parameter, 1)
                this.determineState()
                break
            case 2:
                this.removeConnection(origin, destination, parameter)
                //Clear the rules out of the node to be removed
                for(let iter = 0; iter < this.listOfNodes.length; iter++) {
                    if (this.listOfNodes[iter].nodeID === parseInt(origin)) {
                        this.listOfNodes[iter].removeRule(command)
                        break
                    }
                }
                //this.listOfNodes[origin].removeRule(command)
                if (origin != destination) {
                    //Clear any linked rules from other nodes pointing to this node
                    for(let iter = 0; iter < this.listOfNodes.length; iter++) {
                        if (this.listOfNodes[iter].nodeID === parseInt(destination)) {
                            this.listOfNodes[iter].removeLinkedRule(command)
                            break
                        }
                    }
                    //this.listOfNodes[destination].removeLinkedRule(command)
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

    //Builds a table which is used for DFA simplificaiton
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
    //!!!Perform more testing to ensure this works!!!
    simplifyDFA() {
        //Check if the Automaton is a DFA
        if (this.automatonType != 1) {
            //console.log("Error: DFA not detected")
            return -1            
        }
        else if (this.listOfNodes.length <= 2) {
            return -1
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

    //The helper handles removing and fixing the connections between nodes
    simplifyDFAHelper(nodeGroups) {
        let rules = []

        //Relink all affected nodes
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
                this.removeConnection(parseInt(command[0]), parseInt(command[1]), command[2])
                if (parseInt(command[1]) === nodeGroups[iter][1]) {
                    //If so, make the command a looping statement
                    command[1] = command[0]
                }

                //Save the command for later user
                rules.push([command[0],command[1], command[2]])
            }

            //Update the rules of the non-removed node
            for (let innerIter = 0; innerIter < rules.length; innerIter++) {
                this.buildConnection(parseInt(rules[innerIter][0]), parseInt(rules[innerIter][1]), rules[innerIter][2])
                this.updateLink(parseInt(rules[innerIter][0]), parseInt(rules[innerIter][1]), rules[innerIter][2], 1)
            }

            //Clear out rules for the next repeat
            rules = []
        }

        //Might not be needed any more
        /*
        //Relink any nodes that point to the node to be deleted
        for (let iter = 0; iter < nodeGroups.length; iter++) {
            if (this.listOfNodes[nodeGroups[iter][1]].linkedRules.length > 0) {
                let rulesSize = this.listOfNodes[nodeGroups[iter][1]].linkedRules.length
                for (let innerIter = 0, leftShift = 0; innerIter < rulesSize; innerIter++, leftShift--) {
                    let command = this.statementParser(this.listOfNodes[nodeGroups[iter][1]].linkedRules[innerIter + leftShift])
                    this.updateLink(command[0], command[1], command[2], 2)
                    if (parseInt(command[1]) === nodeGroups[iter][1]) {
                        //If so, make the command a looping statement
                        command[1] = nodeGroups[iter][0]
                    }
                    this.updateLink(command[0], command[1], command[2], 1)
                }
            }
        }
        */

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
        for (let iter = 0; iter < nodeGroups.length; iter++) {
            //This will miss linkedRules removals, but that that can be ignored
            this.removeNode(nodeGroups[iter][1])
        }
    }

    //Check if a node CAN reach a goal state, if not then remove said node
    removeDeadStates() {
        let deadStates = []
        for (let iter = 0; iter < this.listOfNodes.length; iter++) {
            let internalRules = 0
            for (let innerIter = 0; innerIter < this.listOfNodes[iter].rules.length; innerIter++) {
                let command = this.statementParser(this.listOfNodes[iter].rules[innerIter]) 
                //Check if the node points to itself AND it isn't either a start or goal node
                if (command[0] === command[2] && this.listOfNodes[iter].nodeID === 0) {
                    internalRules++
                }    
            }

            //If all the rules inside a node point to themselves, then the node is a dead state
            if (internalRules >= this.listOfNodes[iter].rules.length) {
                deadStates.push(this.listOfNodes[iter].nodeID)
            }
        }

        if (deadStates.length > 0) {
            //Remove the found deadStates
            for (let iter = 0; iter < deadStates.length; iter++) {
                this.removeNode(deadStates[iter])
            }
            return 0
        }
        else {
            //No more dead states found
            return -1
        }
    }

    convertToRegularExpression() {
        //Generate a copy of listOfNodes and connectionList
        //  for restoring the automaton after performing the
        //  State Elimination method of Regular Expression
        //  generation
        this.copyOfListOfNodes = this.listOfNodes.slice()
        this.connectionListCopy = this.connectionList.slice()
        
        //First, remove the dead States prior to state Removal
        while (this.removeDeadStates() != -1) {}

        //Add two new states to convert to a General NFA
        let startNode = 0
        let goalIdxs = []
        for (let iter = 0; iter < this.listOfNodes.length; iter++) {
            //If the node is the starting position, save the index for 
            //  the next step
            if (this.listOfNodes[iter].identity === 1) {
                startNode = this.listOfNodes[iter].nodeID
            }
            //Else if the node is a goal state, save the index in an
            //  array for the next step (This step involves potentially 
            //  multiple nodes that need to be changed/altered)
            else if (this.listOfNodes[iter].identity === 2) {
                goalIdxs.push(this.listOfNodes[iter].nodeID)
            }
        }

        //Create the new start node
        let newNodePos = this.listOfNodes.length
        this.addNode(0,0)
        //This will create the "Free" move
        this.updateLink(this.listOfNodes[newNodePos].nodeID, startNode, 'E', 1)
        //Update the nodes to swapped
        this.updateIdentity(this.listOfNodes[newNodePos].nodeID, 1)
        this.updateIdentity(startNode, 0) 

        //Create the new goal node
        newNodePos = this.listOfNodes.length
        this.addNode(999,999)
        this.updateIdentity(this.listOfNodes[newNodePos].nodeID, 2)
        //Update all the goal nodes so they point to the new goal node
        for (let iter = 0; iter < goalIdxs.length; iter++) {
            //Create the "Free" move
            this.updateLink(goalIdxs[iter], this.listOfNodes[newNodePos].nodeID, 'E', 1)
            //Update the goal node to now be a terminal
            this.updateIdentity(goalIdxs[iter], 0)
        }

        
        //This handles the removing part of the conversion
        while(this.listOfNodes.length > 2) {
            //First, get the nodeIdx for listOfNodes to start removing nodes
            let nodeToRemoveIdx = 0
            let nodeIDToRemove = 0
            for (let iter = 0; iter < this.listOfNodes.length; iter++) {
                if (this.listOfNodes[iter].identity === 0) {
                    nodeToRemoveIdx = iter 
                    nodeIDToRemove = this.listOfNodes[iter].nodeID
                    break
                }
            }

            //Now, build the In/Out table for the node that is to be removed
            //IN is for all the linkedRules of the node (Origin)
            //OUT is for all the rules of the node (Destination)
            //Example:
            //___IN___|___OUT___
            //  1, 3  |  3, 5
            let IN = []
            let OUT = []

            //Get all the OUT nodeIDs
            for (let iter = 0; iter < this.listOfNodes[nodeToRemoveIdx].rules.length; iter++) {
                let command = this.statementParser(this.listOfNodes[nodeToRemoveIdx].rules[iter]) 
                OUT.push([command[1], command[2]])
            }

            //Get all the In nodeIDS
            for (let iter = 0; iter < this.listOfNodes[nodeToRemoveIdx].linkedRules.length; iter++) {
                let command = this.statementParser(this.listOfNodes[nodeToRemoveIdx].linkedRules[iter], 1)
                //Remove now unused connections between nodes
                this.updateLink(command[0], command[1], command[2], 2)
                IN.push([command[0], command[2]])
            }

            //Now, build each statement for the Regular Expression
            for (let iterOne = 0; iterOne < IN.length; iterOne++) {
                let statement = ''

                //First flag checks the amount of lines that go from one node to either another
                //  node or itself, in which case a + should be used
                //Second flag checks if a variable is looping, and is incremented and decremented
                //  for each looping variable found and updated with a *
                let flags = [0, 0]
                let statementPieces = []

                for (let iterTwo = 0; iterTwo < OUT.length; iterTwo++) {
                    if (parseInt(OUT[iterTwo][0]) === nodeIDToRemove) {
                        statementPieces.push(OUT[iterTwo][1])
                        flags[0] += 1
                        flags[1] += 1
                    }
                    else {
                        if (OUT[iterTwo][1] != 'E') {
                            statementPieces.push(OUT[iterTwo][1])
                        }

                        if (IN[iterOne][1] != 'E') {
                            statement += IN[iterOne][1]
                            //statementPieces.push(IN[iterOne][1])
                        }

                        for (;statementPieces.length > 0;) {
                            //Statement building logic here
                            if (flags[0] >= 2) {
                                flags[0] = 0
                                flags[1] = 0
                                statement += `(${statementPieces[0]}U${statementPieces[1]})*`
                                statementPieces.splice(0, 2)
                            }
                            else if (flags[1] > 0) {
                                flags[1] -= 1
                                if (statementPieces[0].substr(statementPieces[0].length - 1, 1) === '*') {
                                    statement += statementPieces[0]
                                }
                                else {
                                    statement += `${statementPieces[0]}*`
                                }
                                statementPieces.splice(0, 1)
                            }
                            else {
                                if (statement === statementPieces[0]) {
                                    statement += '*'
                                }
                                else {
                                    statement += statementPieces[0]       
                                }
                                statementPieces.splice(0, 1)
                            }
                        }

                        //Encase each piece in parentheses once the
                        //  construction is complete
                        //statement = `(${statement})`
                        this.updateLink(IN[iterOne][0], OUT[iterTwo][0], statement, 1) 
                        statement = ''
                        flags = [0, 0]
                    }
                }
            }

            //Remove the node now that all needed steps are done
            this.removeNode(nodeIDToRemove) 
        }
        
        //Final "Removal" will occur when handling the last two nodes
        let command = this.statementParser(this.listOfNodes[0].rules[0])
        this.regularExpression = command[2]
        this.listOfNodes = []
        this.connectionList = []

        
        //Restore the automaton
        this.listOfNodes = this.copyOfListOfNodes.slice()
        this.connectionList = this.connectionListCopy.slice()
        this.copyOfListOfNodes = []
        this.connectionListCopy = []
        
        //Rebuild the automaton based on the rules in connectionList
        // TODO
    }

    //The limit is high, but printing over 10k nodes is 
    // not in the scope of this project
    printNodes(limiter = 9999) {
        for (let iter = 0; (iter < limiter && iter < this.listOfNodes.length); iter++) {
            console.log("====================")
            console.log(`Node ${iter + 1}`)
            console.log("X Pos: ", this.listOfNodes[iter].cx, "")
            console.log("Y Pos: ", this.listOfNodes[iter].cy, "")
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

    //Testing function
    //1 For DFA
    //2 For NFA
    //3 For RE
    testMembership(testSet, opFlag) {
        let result = 1
        for (let iter = 0; iter < testSet.length; iter+=2) {
            switch(opFlag) {
                case 1:
                    result = this.testMembershipDFA(testSet[iter])
                    if (result != testSet[iter + 1]) {
                        console.log(`ERROR found in DFA membership test #${iter / 2}`)
                    }
                    break
                case 2:
                    result = this.testMembershipNFA(testSet[iter])
                    if (result != testSet[iter + 1]) {
                        console.log(`ERROR found in NFA membership test #${iter / 2}`)
                    }
                    break
                case 3:
                    result = this.testMembershipRE(testSet[iter])
                    if (result != testSet[iter + 1]) {
                        console.log(`ERROR found in RE membership test #${iter / 2}`)
                    }
                    break
            }   
        }
    }
}

class node {
    constructor(x, y, id, iden) {
        this.cx = x,
        this.cy = y,
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
                return
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
                return
            }
        }
        //Should the statement not be found, this is an error and should be reported
        //console.log("Error, statement not found!")
    }
}

//String set to test each function on the given default DFA
let testSetDFA = [
    'aaa', -1,
    'aba', 0,
    'aab', 0,
    'baa', 0,
    'aaaaaaaa', -1,
    'a', -1,
    'b', 0
]

let testSetNFA = [
    'aaa', 0,
    'aba', 0,
    'aab', 0,
    'baa', 0,
    'aaaaaaaa', 0,
    'a', 0,
    'b', 0
]



//Testing
const autoOne = new automaton("Test 1") //Dummy Name
const autoTwo = new automaton("Test 2") //Dummy Name
const autoThree = new automaton("Test 3") //Dummy Name

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

console.log(autoOne.connectionList)
autoOne.removeNode(1)
console.log(autoOne.connectionList)

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

//autoOne.printNodes()

//Below ERROR should be fixed now!
//Simplification does not re-link from other affected nodes (FIX)

/*
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
*/

/*
for (let i = 0; i < autoOne.transitionValues.length; i++ ) { 
    console.log(autoOne.transitionValues[i])
}
*/

//Checks if removeNode works
//autoOne.removeNode(1)

//Adds a node post removal to ensure that the proper nodeID is being used
//autoOne.addNode(0, 30.77, 70.34)
//autoOne.printNodes()

/*
autoOne.buildConnection(1, 0, 'a')
autoOne.buildConnection(0, 1, 'a')
//autoOne.removeConnection(0, 1, 'a')

console.log(autoOne.connectionList[0])
console.log(autoOne.connectionList[1])
*/

//connectionList should work as the top list of all connections
//console.log(autoOne.connectionList)

/*
//Works to generate a temporary list of nodes to restore from
autoOne.addNode(31, 0)
autoOne.addNode(13, 0)

autoOne.copyOfListOfNodes = autoOne.listOfNodes.slice()
autoOne.removeNode(0)
*/


/*
//Should perform conversion without need of inputs (All internal)
autoOne.convertToRegularExpression()
console.log(autoOne.regularExpression)
console.log("============================")
autoOne.printNodes()
*/
/*
let testVal = autoOne.testMembership(testSetDFA, 1)


if (testVal === -1) {
    console.log("Membership failed")
}
else {
    console.log("Membership Confirmed")
}

//Test DFA structure (its also an NFA by virtue)
// ->0 <--> 1
//   |      |
//  *2 <-> *3
//Create the top nodes
autoTwo.addNode(13, 17)
autoTwo.updateIdentity(0, 1)
autoTwo.addNode(33, 17)
//Link them together
autoTwo.updateLink(0, 1, 'a', 1)
autoTwo.updateLink(1, 0, 'a', 1)
//create the bottom nodes
autoTwo.addNode(13, 37)
autoTwo.updateIdentity(2, 2)
autoTwo.addNode(33, 37)
autoTwo.updateIdentity(3, 2)
//Link the bottom nodes together
autoTwo.updateLink(2, 2, 'b', 1)
autoTwo.updateLink(3, 3, 'b', 1)
autoTwo.updateLink(3, 2, 'a', 1)
autoTwo.updateLink(2, 3, 'a', 1)
//Link the top nodes to the bottom nodes
autoTwo.updateLink(0, 2, 'b', 1)
autoTwo.updateLink(1, 3, 'b', 1)
autoTwo.updateLink(0, 2, 'a', 1) //Last addition to test the logic
//Now this should return Confirmed since there is now a link between 0 and 2 that accepts 'a'
let testVal2 = autoTwo.testMembership(testSetNFA, 2)

if (testVal2 === -1) {
    console.log("Membership failed")
}
else {
    console.log("Membership Confirmed")
}

autoThree.setRegularExpression('a*b.(aUb)*')
let testVal3 = autoThree.testMembership(testSetDFA, 3)

if (testVal3 === -1) {
    console.log("Membership failed")
}
else {
    console.log("Membership Confirmed")
}
*/