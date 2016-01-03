////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Add Sounds From Library To Timeline////////////////////////////////////////////////////////////////////
// Copyright (c) 2016 Jean-Christophe Kleinbourg, licensed under the MIT License
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var dom = fl.getDocumentDOM();
var lib = dom.library;
var timeline = dom.getTimeline();

//determine starting frame from cursor
var frame_cursor = timeline.getSelectedFrames()[timeline.getSelectedFrames().length - 1];
if (!frame_cursor) {
	frame_cursor = 1;
}

var layer_sounds;
var layer_labels;
var sound_counter = 0;
var soundsBitRate;
var frameRate = dom.frameRate;
var gap;
var labels = false;

//show dialog
var xmlPanelOutput = fl.getDocumentDOM().xmlPanel(fl.configURI + "Commands/Add Sounds From Library To Timeline.xml");
if (xmlPanelOutput.dismiss == "accept") {
	soundsBitRate = parseInt(xmlPanelOutput.bitrate);
	gap = parseInt(xmlPanelOutput.gap);
	if (xmlPanelOutput.labels == "true") {
		labels = true;
	}
	run();
}

function run() {
	//check layers, if not, create
	if (!timeline.findLayerIndex("Sounds")) {
		timeline.addNewLayer("Sounds");
	}

	if (labels) {
		if (!timeline.findLayerIndex("Labels")) {
			timeline.addNewLayer("Labels");
		}
	}

	var layers = timeline.layers;

	for (var i = 0; i < layers.length; i++) {
		if (layers[i].name == "Sounds") {
			layer_sounds = i;
		} else if (layers[i].name == "Labels") {
			layer_labels = i;
		}
	}

	//calculate overflow
	timeline.selectAllFrames();
	var overflow = timeline.getSelectedFrames()[timeline.getSelectedFrames().length - 1] - frame_cursor - 1;

	for (i = 0; i < lib.items.length; i++) {
		if (lib.items[i].itemType == "sound") {

			sound_counter++;

			//calculate sound duration
			var duration = Math.ceil(FLfile.getSize(lib.items[i].sourceFilePath) / (soundsBitRate / 8) / 1000 * dom.frameRate);
			duration = duration + gap;

			//adjust overflow
			var frames_to_add = duration - overflow;
			if (frames_to_add < 0) {
				frames_to_add = 0;
				overflow = overflow - duration;
				if (overflow < 0) {
					overflow = 0;
				}
			} else {
				overflow = 0;
			}

			//extend timeline
			for (j = 0; j < layers.length; j++) {
				timeline.setSelectedLayers(j);
				timeline.setSelectedFrames(frame_cursor - 1, frame_cursor);
				timeline.insertFrames(frames_to_add);
			}

			//add label
			if (labels) {
				timeline.setSelectedLayers(layer_labels);
				timeline.insertKeyframe(frame_cursor);
				timeline.layers[layer_labels].frames[frame_cursor].name = "s" + zeroFill(sound_counter, 2);
			}

			//add sound
			timeline.setSelectedLayers(layer_sounds);
			timeline.insertKeyframe(frame_cursor);
			dom.addItem({
				x : 0,
				y : 0
			}, lib.items[i]);

			frame_cursor += duration;
		}
	}
	if (sound_counter == 0) {
		alert("No sound in library");
	}
}

function zeroFill(number, width) {
	width -= number.toString().length;
	if (width > 0) {
		return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
	}
	return number + "";
}
