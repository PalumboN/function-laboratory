'use strict'

const assert = chai.assert

const blocklyWorkspaceMock = function () {
  let workspace = new Blockly.WorkspaceSvg({})
  workspace.createDom()
  workspace.cachedParentSvg_ = { getScreenCTM: () => { } }
  Blockly.mainWorkspace = workspace
  workspace.highlightBlock = () => { } //TODO: Use sinon
  return workspace
}

const onWorkspace = (name, test) => {
  var workspace = blocklyWorkspaceMock()
  it(name, () => {
    try {
      test(workspace)
    } finally {
      workspace.dispose()
    }
  })
}

const connect = (block, parameterBlock, inputIndex = 0) => {
  block.inputList[inputIndex].connection.connect(parameterBlock.outputConnection)
  forceBlocklyEvents()
  forceBlocklyEvents() // ??
}

const disconnect = (block, inputIndex = 0) => {
  block.inputList[inputIndex].connection.disconnect()
  forceBlocklyEvents()
  forceBlocklyEvents() // ??
}


// This forces synchronous onchange() calls.
const forceBlocklyEvents = () => Blockly.Events.fireNow_()



// Assertions
const assertConnection = (parentBlock, block) => {
  assert.include(parentBlock.getChildren().map(({ id }) => id), block.id)
}

const assertRejectedConnection = (parentBlock, block) => {
  assert.notInclude(parentBlock.getChildren().map(({ id }) => id), block.id)
}

const assertColor = (block, color) => {
  assert.equal(colorShow(block), color)
}
// Assertions

// Block creation

const newBlockWithFields = (workspace, type, fields = {}) => {
  const newBlock = workspace.newBlock(type)
  Object.entries(fields).forEach(([fieldName, value]) => {
    newBlock.setFieldValue(value, fieldName);
  });
  return newBlock
}
