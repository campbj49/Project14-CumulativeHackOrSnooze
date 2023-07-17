"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();
  
  let favStar = "☆";
  if(currentUser.findFavoriteIndex(story.storyId) != undefined) favStar = "★";

  return $(`
      <li id="${story.storyId}">
        <span class = "star">${favStar}</span>
        <span class ="delete">X</span>
        <div>
          <a href="${story.url}" target="a_blank" class="story-link">
            ${story.title}
          </a>
          <small class="story-hostname">(${hostName})</small>
          <small class="story-author">by ${story.author}</small>
          <small class="story-user">posted by ${story.username}</small>
        </div>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function submitNewStory(evt){
  console.debug("submitNewStory", evt);
  evt.preventDefault();

  let submittedStory = {
    author:$("#story-author").val(),
    title: $("#story-title").val(),
    url: $("#story-url").val(),
  }
  await storyList.addStory(currentUser,submittedStory);
  $addStoryForm.trigger("reset");
  updateUIOnNewStorySubmit();
}
$addStoryForm.on("submit", submitNewStory);

function updateUIOnNewStorySubmit(){
  console.debug("updateUIOnNewStorySubmit");
  getAndShowStoriesOnStart()
  $addStoryForm.hide();
}

/**Remove a story from the API
 * -id: storyID to be deleted
 */

async function deleteStory(id){
  currentUser.removeFavorite(id);
  const response = await axios({
    url: `${BASE_URL}/stories/${id}`,
    method:"DELETE",
    data:{token:currentUser.loginToken}
  });
}

/** Event listener to add and remove the favorite property from stories */
async function listHandler(evt){
  let star = evt.target;
  console.log(star.className);
  if(star.className ==="star"){
    let storyID = star.parentElement.id;
    if(star.innerText === "★"){
      star.innerText = "☆";
      currentUser.removeFavorite(storyID);
    }
    else {
      star.innerText = "★";
      currentUser.addFavorite(storyID);
    }
  }

  if(star.className==="delete"){
    await deleteStory(star.parentElement.id);
    getAndShowStoriesOnStart();
  }
}
$allStoriesList.on("click",listHandler);