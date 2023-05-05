function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function injectHTML(list) {
  console.log('fired injectHTML');
  const target = document.querySelector('#restaurant_list');
  target.innerHTML = '';
  list.forEach((item) => {
    const str = `<li>${item.name}: ${item.category}</li>`;
    target.innerHTML += str;
  });
}

function filterList(list, query) {
  return list.filter((item) => {
    const LCaseName = item.name.toLowerCase();
    const LCaseQuery = query.toLowerCase();
    return LCaseName.includes(LCaseQuery);
  })
}

function processRestaurants(list) {
  console.log('fired restaurants list');
  const range = [...Array(15).keys()];
  return newArray = range.map((item) => {
    const index = getRandomIntInclusive(0, list.length - 1);
    return list[index]
  });
}

function initChart(chart, object){
  const labels = Object.keys(object);
  const info = Object.keys(object).map((item)=> object[item].length);
  
  return new Chart(chart, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Restaurants By Category',
        backgroundColor: 'rgb(255, 99, 132)',
        borderColor: 'rgb(255, 99, 132)',
        data: info
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });

}

function changeChart(chart, object){
  const labels = Object.keys(object);
  const info = Object.keys(object).map((item)=> object[item].length);

  chart.data.labels = labels;
  chart.data.datasets.forEach((dataset) => {
      dataset.data = info;
      return dataset;
  });
  chart.update();
}

async function getData(){
  const url ='https://data.princegeorgescountymd.gov/resource/umjn-t2iz.json';
  const data = await fetch(url);
  const json = await data.json();
  const reply = json.filter((item) => Boolean(item.geocoded_column_1)).filter((item) => Boolean(item.name));
  return reply;
}

function shapeDataForChart(array){
  return array.reduce((collection, item)=>{
    if(!collection[item.category]){
      collection[item.category] = [item]
    } else{
      collection[item.category].push(item);
    }
    return collection;
  }, {});
}

async function mainEvent() { // the async keyword means we can make API requests
  const mainForm = document.querySelector('.main_form'); // This class name needs to be set on your form before you can listen for an event on it
  // const filterButton = document.querySelector('#filter_button');// Add a querySelector that targets your filter button here
  const loadDataButton = document.querySelector('#data_load');// Add a querySelector that targets your load county data button here
  const generateListButton = document.querySelector('#generate');// Add a querySelector that targets your generate button here
  const chartTarget = document.querySelector('#myChart');
  const loadAnimation = document.querySelector('#load_animation');
  loadAnimation.style.display = 'none';
  generateListButton.classList.add('hidden');
  const textField = document.querySelector('#resto');

  const storedData = JSON.parse(localStorage.getItem('storedData'));
  if (storedData.length > 0) {
    generateListButton.classList.remove('hidden');
  }

  //let storedList = [];
  let currentList = []; // this is "scoped" to the main event function

  /* We need to listen to an "event" to have something happen in our page - here we're listening for a "submit" */

  loadDataButton.addEventListener('click', async (submitEvent) => { // async has to be declared on every function that needs to "await" something

    // This prevents your page from becoming a list of 1000 records from the county, even if your form still has an action set on it
    submitEvent.preventDefault();
    // this is substituting for a "breakpoint" - it prints to the browser to tell us we successfully submitted the form
    console.log('loading data...');
    loadAnimation.style.display = 'inline-block';
    // Basic GET request - this replaces the form Action
    const results = await fetch('https://data.princegeorgescountymd.gov/resource/umjn-t2iz.json');
    // This changes the response from the GET into data we can use - an "object"

    // const chartData = await getData();
    const storedList = await results.json();
    localStorage.setItem('storedData',JSON.stringify(storedList));
    /*
      This array initially contains all 1,000 records from your request,
      but it will only be defined _after_ the request resolves - any filtering on it before that
      simply won't work.
    */
    loadAnimation.style.display = 'none';
    console.table(storedList);
    injectHTML(storedList);
    const localData = shapeDataForChart(storedList);
    changeChart(myChart, localData);
    
  });

  /**filterButton.addEventListener('click', (event) => {
    console.log('Clicked FilterButton');
    const formData = new FormData(mainForm);
    const formProps = Object.fromEntries(formData);
    console.log(formProps);
    const newList = filterList(currentList, formProps.resto);
    console.log(newList);
    injectHTML(newList);
  })**/

  generateListButton.addEventListener('click', (event) => {
    console.log('generate new list');
    currentList = processRestaurants(storedData);
    console.log(currentList);
    injectHTML(currentList);
  })

  textField.addEventListener('input', (event) => {
    console.log('input', event.target.value);
    const newList = filterList(currentList, event.target.value);
    console.log(newList);
    injectHTML(newList);
  })

  //filterList
}
/*
  This adds an event listener that fires our main event only once our page elements have loaded
  The use of the async keyword means we can "await" events before continuing in our scripts
  In this case, we load some data when the form has submitted
*/
document.addEventListener('DOMContentLoaded', async () => mainEvent()); // the async keyword means we can make API requests