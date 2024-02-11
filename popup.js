document.addEventListener('DOMContentLoaded', function() {
  console.log("Popup loaded.");
  updatePopup();
});
///
const visitedHostnames = new Set();
///

const urlColorsMap = new Map();


function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function updatePopup() {
  chrome.runtime.sendMessage("getData", function(response) {
      console.log("Received tabData from background:", response);
      const websiteList = document.getElementById('websiteList');
      const totalTimePerURL = {};
      
      // Clear previous data
      websiteList.innerHTML = '';
      
    
      // Aggregate total time spent per URL
      for (let tabId in response) {
          const tabData = response[tabId];
          for (let url in tabData.totalTime) {
              if (!totalTimePerURL[url]) {
                totalTimePerURL[url] = 0;
              }
              totalTimePerURL[url] += tabData.totalTime[url];
          }
      }
      
      // Convert the aggregated data into the format required for the pie chart
      for (let url in totalTimePerURL) {
        const timeSpent = totalTimePerURL[url];
        const formattedTime = formatTime(timeSpent);
        
        const listItem = document.createElement('li');
        listItem.textContent = `${url}: ${timeSpent}`;
        websiteList.appendChild(listItem);
      
      
      let color = urlColorsMap.get(url);
        if (!color) {
          color = getRandomColor();
          urlColorsMap.set(url, color);
        }
        listItem.style.color = color; // Apply color to the list item
    
      }




      // After updating the list, draw the pie chart
     drawPieChart(totalTimePerURL);
  });
  setTimeout(updatePopup, 1000); // Update every second
}

/*

*/


function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  return `${formattedHours}:${formattedMinutes}`;
}


function drawPieChart(totalTimePerURL) {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext('2d');

  // Prepare data for pie chart
  const data = [];
  let total = 0;
  for (let url in totalTimePerURL) {
    const timeSpent = totalTimePerURL[url];
    data.push({ label: url, value: timeSpent, color: urlColorsMap.get(url) });
    total += timeSpent;
  }

  // Draw pie chart
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let startAngle = 0;
  data.forEach((item, index) => {
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const randomColor = getRandomColor();
    
    // Draw slice
    ctx.fillStyle = item.color;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, startAngle, startAngle + sliceAngle);
    ctx.closePath();
    ctx.fill();
    
    // Update start angle for next slice
    startAngle += sliceAngle;
  });
  return canvas;
}
