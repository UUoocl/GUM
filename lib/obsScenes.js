//after connecting to OBS get the Scenes and Sources
async function getScenes() {
    //create collection object
    let collection = new Object
    collection.scenes = []

    //get scenes from OBS
    const sceneList = await obs.call("GetSceneList");        
    
    //update scene object
        for(let i =0; i < sceneList.scenes.length; i++){
            //for the sources for each scene
            let sources = await obs.call("GetSceneItemList", { sceneName: sceneList.scenes[i].sceneName })
            let sourceArray =[]
            //get just the source name
            sources.sceneItems.forEach(source =>{
                sourceArray.push(source.sourceName)   
            })

            //put the scene name and source names in an object
            const sceneAndSources = new Object()
            sceneAndSources.sceneName = sceneList.scenes[i].sceneName
            sceneAndSources.sources = sourceArray

            //add the scene name and sources to the collection object
            collection.scenes.push(sceneAndSources)
        }
    //display the collection on the page
     document.getElementById("scenesList").innerHTML = JSON.stringify(collection,null,1)
}
const copyButtonLabel = "Copy";

// use a class selector if available
let blocks = document.querySelectorAll("pre");

blocks.forEach((block) => {
  // only add button if browser supports Clipboard API
  if (navigator.clipboard) {
    let button = document.createElement("button");

    button.innerText = copyButtonLabel;
    block.prepend(button);

    button.addEventListener("click", async () => {
      await copyCode(block, button);
    });
  }
});

async function copyCode(block, button) {
  let code = block.querySelector("code");
  let text = code.innerText;

  await navigator.clipboard.writeText(text);

  // visual feedback that task is completed
  button.innerText = "Code Copied";

  setTimeout(() => {
    button.innerText = copyButtonLabel;
  }, 700);
}