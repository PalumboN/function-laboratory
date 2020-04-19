<link rel="shortcut icon" type="image/x-icon" href="favicon.ico">

<script src="blockly/blockly_compressed.js"></script>
<script src="blockly/blocks_compressed.js"></script>
<script src="blockly/msg/js/es.js"></script>
<script src="functions.js"></script>

<div id="blocklyDiv" style="height: 480px; width: 600px;"></div>

<xml id="toolbox" style="display: none">
  <block type="composition"></block>
  <block type="even"></block>
  <block type="not"></block>
  <block type="length"></block>
  <block type="compare"></block>
  <block type="math_number"></block>
  <block type="math_arithmetic"></block>
  <block type="charAt"></block>
  <block type="text"></block>
 /xml>

<script>
  var workspace = Blockly.inject('blocklyDiv', {toolbox: document.getElementById('toolbox')})
</script>
  