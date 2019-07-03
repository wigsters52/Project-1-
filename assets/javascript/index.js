
document.addEventListener('DOMContentLoaded', event => {
  // const youtubeApi = 'AIzaSyDdO6zQx64o6U30fQa4U_RDaRaepGAY - Uk'
  // const ticketMasterAPI = '0Dxr1ahmvB1MnD2htrHAWLPBmNAXIbmc'
  let latLong = ''
  let sort = 'date'
  const format = dateFns.format

  const randomizer = max => {
    const number = Math.floor(Math.random() * max)
    return number
  }

  // Shorthand for getElementById
  const select = id => document.getElementById(id)

  // Whatever type of html element needs to be created in the ("")
  const createEl = el => document.createElement(el)

  // The id of the element you want to hide
  const hideElement = id => {
    select(id).style.display = 'none'
  }

  // The id of element you want to show and the display style (block, inline block, flex etc)
  const showElement = (id, display) => {
    select(id).style.display = display
  }

  // creates element and sets text to whatever value is passed
  const setEl = (el, text) => {
    const element = createEl(el)
    element.textContent = text
    return element
  }

  // Used to empty the table before a new search
  const empty = id => {
    const el = select(id)
    while (el.firstChild) {
      el.removeChild(el.firstChild)
    }
  }

  // If IP location fails this will ask you to use your location via html geolocate
  const geoLocate = () => {
    if (window.navigator && window.navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        onGeolocateSuccess,
        onGeolocateError
      )
    }
  }

  const onGeolocateSuccess = coordinates => {
    latLong = coordinates.coords.latitude + ',' + coordinates.coords.longitude
    sort = 'distance'
    ticketRequest()
  }

  const onGeolocateError = error => {
    sort = 'date'
    console.warn(error.code, error.message)
  }

  // Fires on page load to get location by IP address
  const IPLocate = () => {
    $.ajax({
      type: 'GET',
      url:
        'https://api.ipdata.co?api-key=b10d7fd45c8c314294f1e47b52ab9bef1bf60bb2056164abfdd12865'
    }).then(
      function success (response) {
        sort = 'distance'
        latLong = response.latitude + ',' + response.longitude
        ticketRequest()
      },
      function fail (error) {
        sort = 'date'
        console.warn(error.code, error.message)
        geoLocate()
      }
    )
  }

  // Gathers price range from API call if there is one else returns not available
  // Also links to page to purchase tickets
  const priceRange = (response, i) => {
    if (response._embedded.events[i].priceRanges) {
      const prices = createEl('td')
      const priceLink = createEl('a')
      priceLink.setAttribute('href', response._embedded.events[i].url)
      priceLink.setAttribute('target', 'blank')
      priceLink.textContent =
        '$' +
        response._embedded.events[i].priceRanges[0].min +
        ' - ' +
        '$' +
        response._embedded.events[i].priceRanges[0].max
      prices.append(priceLink)
      return prices
    } else {
      const prices = createEl('td')
      const priceLink = createEl('a')
      priceLink.setAttribute('href', response._embedded.events[i].url)
      priceLink.setAttribute('target', 'blank')
      priceLink.textContent = 'Price Unavailable'
      prices.append(priceLink)
      return prices
    }
  }

  // Appends all the created elements to the row and inserts into table
  const tableEntry = (response, i) => {
    const row = createEl('tr')
    const name = setEl('td', response._embedded.events[i].name)
    const venue = setEl(
      'td',
      response._embedded.events[i]._embedded.venues[0].name
    )
    // const city = setEl(
    //   'td',
    //   response._embedded.events[i]._embedded.venues[0].city.name
    // )
    const date = setEl(
      'td',
      format(
        response._embedded.events[i].dates.start.localDate,
        'MMMM, Do YYYY'
      )
    )
    const time = setEl(
      'td',
      format(response._embedded.events[i].dates.start.dateTime, 'h:mm aa')
    )
    const price = priceRange(response, i)
    row.append(name, venue, date, time, price)
    select('tbody').append(row)
  }

  // If search returns no results gives feedback
  const noData = () => {
    const row = createEl('tr')
    const na = setEl(
      'td',
      'Nothing Available Please choose another Comedian or City'
    )
    row.append(na)
    select('tbody').append(row)
  }

  // Ajax request and for loop to append data to the table
  const ticketRequest = () => {
    const comedianName = select('searchComedian').value
    const city = select('searchCity').value
    const querylUrl = `https://app.ticketmaster.com/discovery/v2/events.json?keyword=${comedianName}&latlong=${latLong}&city=${city}&classificationName=comedy&size=10&sort=${sort},asc&apikey=0Dxr1ahmvB1MnD2htrHAWLPBmNAXIbmc`
    $.ajax({
      type: 'GET',
      url: querylUrl
    }).then(function (response) {
      if (response.page.totalElements === 0) {
        showElement('table', 'table')
        noData()
        select('form').reset()
      } else {
        const randomComedian = randomizer(response._embedded.events.length)
        videoFunction(response._embedded.events[randomComedian].name)
        for (let i = 0; i < response._embedded.events.length; i++) {
          showElement('table', 'table')
          tableEntry(response, i)
        }
        select('form').reset()
      }
    })
  }

  // Takes video Id from API call and appends it to the page
  const videoAppend = response => {
    showElement('player', 'block')
    const vid = createEl('iframe')
    vid.setAttribute('src', `https://www.youtube.com/embed/${response}`)
    select('player').append(vid)
  }

  // hideElement('player')

  // player.source = {
  //   type: 'video',
  //   sources: [
  //     {
  //       src: 'bTqVqk7FSmY',
  //       provider: 'youtube'
  //     }
  //   ]
  // }

  const videoFunction = randomComedian => {
    const key = 'AIzaSyDc9k0Rzdqb36ZC_q95ruTMOF9yA51l8JA'
    const comedianName = select('searchComedian').value || randomComedian
    const URL = 'https://www.googleapis.com/youtube/v3/search'
    let options = {
      part: 'snippet',
      key: key,
      q: comedianName + 'stand up',
      maxResults: 20,
      // 'order': 'relevance',
      type: 'video',
      safeSearch: 'none',
      videoCategory: 'comedy',
      topicId: '/m/05qjc'
      // 'videoCategoryId': 'comedy'
      // 'order': 'videoCount',
      // 'relevanceLanguage': 'en',
      // 'regionCode': 'US'
      // 'channelType':
    }
    // Uses the response to load the video and append it to the page
    function loadVideo () {
      $.getJSON(URL, options, function (response) {
        console.log(response)
        videoAppend(
          response.items[randomizer(response.items.length)].id.videoId
        )
      })
    }
    loadVideo()
  }

  // Listens on form for submit runs ajax request and empties any data out of the table
  select('form').addEventListener('submit', function (event) {
    event.preventDefault()
    empty('tbody')
    empty('player')
    ticketRequest()
    videoFunction()
  })
  hideElement('table')
  IPLocate()
})
