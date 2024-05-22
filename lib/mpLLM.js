// Copyright 2024 The MediaPipe Authors.

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//      http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// ---------------------------------------------------------------------------------------- //


llmIsRunning = true;

import {FilesetResolver, LlmInference} from '../mediapipe_tasks/tasks-genai/genai_bundle.mjs';

const modelFileName = 'mediapipe_models/gemma-2b-it-gpu-int4.bin'; /* Update the file name */

/**
 * Display newly generated partial results to the output text box.
*/
function displayPartialResults(partialResults, complete) {
  gemmaOutput.textContent += partialResults;
  
  if (complete) {
    if (!gemmaOutput.textContent) {
      gemmaOutput.textContent = 'Result is empty';
    }
    gemmaSubmit.disabled = false;
  }
}

const gemmaInput = document.getElementById('gemmaInput');
const gemmaOutput = document.getElementById('gemmaOutput');
const gemmaSubmit = document.getElementById('gemmaSubmit');
let llmInference;

/**
 * Main function to run LLM Inference.
*/
async function runDemo() {
  console.log('Gemma started')
  const genaiFileset = await FilesetResolver.forGenAiTasks(
    'mediapipe_tasks/tasks-genai/wasm');
    
    submit.onclick = () => {
      gemmaOutput.textContent = '';
      gemmaSubmit.disabled = true;
      llmInference.generateResponse(gemmaInput.value, displayPartialResults);
    };

    gemmaInput.onchange = () => {
      gemmaOutput.textContent = '';
      gemmaSubmit.disabled = true;
      llmInference.generateResponse(gemmaInput.value, displayPartialResults);
    };
    
    gemmaSubmit.value = 'Loading the model...'
    LlmInference
    .createFromOptions(genaiFileset, {
      baseOptions: {modelAssetPath: modelFileName},
      // maxTokens: 512,  // The maximum number of tokens (input tokens + output
      //                  // tokens) the model handles.
      // randomSeed: 1,   // The random seed used during text generation.
      // topK: 1,  // The number of tokens the model considers at each step of
      //           // generation. Limits predictions to the top k most-probable
      //           // tokens. Setting randomSeed is required for this to make
      //           // effects.
      // temperature:
      //     1.0,  // The amount of randomness introduced during generation.
      //           // Setting randomSeed is required for this to make effects.
    })
    .then(llm => {
      llmInference = llm;
      gemmaSubmit.disabled = false;
      gemmaSubmit.value = 'Get Response'
    })
    .catch(() => {
      alert('Failed to initialize the task.');
    });

  }
  runDemo();
  
  export function llmChat(llmInput) {
    console.log('gem module',llmInput)
    gemmaInput.innerText = llmInput;
    gemmaOutput.textContent = '';
    gemmaSubmit.disabled = true;
    llmInference.generateResponse(gemmaInput.value, displayPartialResults);
  
    //console.log("message", sentimentMessage)
    //sendBrowserWebSocket(sentimentMessage);
    
    //sendAdvSSWebSocket(result);
    //}
  };
  