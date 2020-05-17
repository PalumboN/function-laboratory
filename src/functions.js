function onChangeValue(event) {
  if (event.blockId == this.id) {
    checkParentConnection(this)
  }
  this.setColour(colorShow(this))
}

function onChangeFunction(event) {
  if (event.blockId == this.id) {
    checkParentConnection(this)
  }
  if (this.getParent() && blockType(this).isFunctionType()) {
    this.setCollapsed(true)
  } else {
    this.setCollapsed(false)
  }
  this.setColour(colorShow(this))
}

function onChangeList(event) {
  onChangeValue.bind(this)(event)
  if (this.workspace.isDragging()) {
    return;  // Don't change state at the start of a drag.
  }
  organizeList(this)
}


function setFunctionType(block, ...types) {
  const outputType = createType(types.slice(-1)[0]);
  const inputTypes = types.slice(0, -1).map(type => createType(type));

  inputTypes.forEach((inputType, i) => { block.inputList[i].inputType = inputType });
  block.outputType = outputType;
}

function buildFuctionBlockWith(name, functionType, cb) {
  Blockly.Blocks[name] = {
    init: function () {
      cb(this)
      this.setInputsInline(true)
      this.setOutput(true)
      this.setOnChange(onChangeFunction.bind(this))
      setFunctionType(this, ...functionType)
      this.setTooltip(blockType(this).toString())
      this.setHelpUrl("")
    },
    reduce() {
      reduceBlock(this)(this.getResultBlock())
    },
    generateContextMenu: function() {
      return [{
        text: "Reducir",
        callback: this.reduce.bind(this),
        enabled: !blockType(this).isFunctionType(),
      }, ...this.__proto__.generateContextMenu.bind(this)()]
    }
  }
}

const buildFuctionBlock = ({name, type, fields = [], getResultBlock = function() { return this }}) =>
  buildFuctionBlockWith(name, type, block => {
    block.appendValueInput(`ARG0`).appendField(fields[0] === undefined ? name : fields[0])
    for (let index = 1; index < type.length - 1; index++) {
      const inputName = fields[index] || ""
      block.appendValueInput(`ARG${index}`).appendField(inputName)
    }
    block.getResultBlock = getResultBlock
  })

const buildInfixFuctionBlock = ([name, field], functionType) =>
  buildFuctionBlockWith(name, functionType, block => {
    block.appendValueInput("LEFT")
    block.appendValueInput("RIGHT")
      .appendField(field)
  })

function decorateInit(block, initExtension) {
  const oldInit = block.init
  function newInit() {
    oldInit.bind(this)();
    initExtension.bind(this)();
  }
  block.init = newInit
}

const reduceBlock = expandedBlock => reducedBlock => {
  reducedBlock.setEditable(false)
  expandedBlockAsXml = Blockly.Xml.blockToDom(expandedBlock)
  reducedBlock.generateContextMenu = function () {
    return [{
      text: "Expandir",
      callback: function() {
        const restoredOldBlock = Blockly.Xml.domToBlock(expandedBlockAsXml, reducedBlock.workspace)
        replace(reducedBlock)(restoredOldBlock)
      },
      enabled: true
    }, ...reducedBlock.__proto__.generateContextMenu.bind(this)()]
  }

  replace(expandedBlock)(reducedBlock)
}

const replace = oldBlock => newBlock => {
  newBlock.initSvg()
  newBlock.moveTo(oldBlock.getRelativeToSurfaceXY())
  oldBlock.dispose()
  newBlock.render()
}

const newListType = (elementType) => new ListType(createType(elementType))

buildFuctionBlock({
  name: "even",
  type: ["Number", "Boolean"],
  getResultBlock: function() {
    const evenResult = this.getChildren()[0].getFieldValue("NUM") % 2 == 0
    newBlock = this.workspace.newBlock("logic_boolean")
    newBlock.setFieldValue(evenResult ? "TRUE" : "FALSE", "BOOL")
    return newBlock
}})
buildFuctionBlock({
  name: "not",
  type: ["Boolean", "Boolean"],
  getResultBlock: function() {
    const notResult = this.getChildren()[0].getFieldValue("BOOL") == "TRUE"
    newBlock = this.workspace.newBlock("logic_boolean")
    newBlock.setFieldValue(notResult ? "FALSE" : "TRUE", "BOOL")
    return newBlock
}})
buildFuctionBlock({
  name: "length",
  type: ["String", "Number"],
  getResultBlock: function() {
    const lengthResult = this.getChildren()[0].getFieldValue("TEXT").length
    newBlock = this.workspace.newBlock("math_number")
    newBlock.setFieldValue(lengthResult, "NUM")
    return newBlock
}})//TODO: List(Char)
buildFuctionBlock({
  name: "charAt",
  type: ["Number", "String", "String"]
})

buildInfixFuctionBlock(["compare", ">"], ["a", "a", "Boolean"])//TODO: Selector
buildInfixFuctionBlock(["apply", "$"], [["a", "b"], "a", "b"])

buildFuctionBlock({
  name: "id",
  type: ["a", "a"],
  getResultBlock: function() {
    const xmlBlock = Blockly.Xml.blockToDom(this.getChildren()[0])
    const copiedBlock = Blockly.Xml.domToBlock(xmlBlock, this.workspace)
    return copiedBlock
} })
buildFuctionBlock({
  name: "composition",
  type: [["b", "c"], ["a", "b"], "a", "c"],
  fields: ["", ".", "$"]
})

buildInfixFuctionBlock(["at", "!!"], [newListType("a"), "Number", "a"])
buildFuctionBlock({
  name: "any",
  type: [["a", "Boolean"], newListType("a"), "Boolean"]
})
buildFuctionBlock({
  name: "all",
  type: [["a", "Boolean"], newListType("a"), "Boolean"]
})
buildFuctionBlock({
  name: "filter",
  type: [["a", "Boolean"],
  newListType("a"),
  newListType("a")]
})
buildFuctionBlock({
  name: "map",
  type: [["a", "b"], newListType("a"), newListType("b")]
})
buildFuctionBlock({
  name: "maximum",
  type: [newListType("a"), "a"]
})
buildFuctionBlock({
  name: "minimum",
  type: [newListType("a"), "a"]
})
buildFuctionBlock({
  name: "fold",
  type: [["a", "b", "a"], "a", newListType("b"), "a"]
})

Blockly.Blocks['list'] = {
  init: function () {
    this.appendValueInput("ELEMENT")
      .appendField("[")
      .inputType = createType("a")
    this.appendDummyInput("CLOSE")
      .appendField("]")
    this.setInputsInline(true)
    this.setOutput(true, null)
    this.setTooltip("")
    this.setHelpUrl("")
    this.setOnChange(function (event) { onChangeList.bind(this)(event) })
    this.outputType = new ListType(createType("a"))
    this.inputIndex = 1
  },

  /**
   * Create XML to represent the (non-editable) name and arguments.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function () {
    var container = document.createElement('mutation')
    this.inputList.filter(isBlockInput).forEach(input => {
      var parameter = document.createElement('arg')
      parameter.setAttribute('name', input.name)
      container.appendChild(parameter)
    })
    return container
  },

  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function (xmlElement) {
    this.inputList.forEach(removeInput(this))

    for (var i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
      if (childNode.nodeName.toLowerCase() == 'arg') {
        const inputName = childNode.getAttribute('name')
        appendNewInputList(this, inputName)
      }
    }
  },
}


Blockly.Blocks["math_arithmetic"].onchange = function (event) {
  setFunctionType(this, "Number", "Number", "Number")
  onChangeFunction.bind(this)(event)
}

Blockly.Blocks["math_number"].onchange = function (event) { onChangeValue.bind(this)(event) }
Blockly.Blocks["math_number"].outputType = createType("Number")

Blockly.Blocks["text"].outputType = createType("String")
Blockly.Blocks["text"].onchange = function (event) { onChangeValue.bind(this)(event) }

Blockly.Blocks["logic_boolean"].outputType = createType("Boolean")
Blockly.Blocks["logic_boolean"].onchange = function (event) { onChangeValue.bind(this)(event) }