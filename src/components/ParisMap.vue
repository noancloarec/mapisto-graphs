
<script setup>
import L from "leaflet";
import { LMap, LTileLayer ,LMarker, LIcon, LImageOverlay} from "@vue-leaflet/vue-leaflet";
import Chart from 'chart.js/auto';
import "leaflet/dist/leaflet.css";

import { onMounted, reactive, ref, watch } from "vue";
const circleSize = ref(200)
const map = ref(null)
onMounted(() => {

    // const chartSize = ref(200)

    // const divIcon = L.divIcon({
    //     html: makeHtml(2),
    //     className: 'divIcon',
    //     iconSize: [200, 200],
    //     iconAnchor: [100, 100]
    //     });

    // const map = L.map('map-container').setView([48.913749, 2.225493], 12);
    // L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    //     maxZoom: 19,
    //     attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    // }).addTo(map);
    // const latLngBounds = L.latLngBounds([[48.913, 2.205], [48.802, 2.428]]);
    // const imageOverlay = L.imageOverlay('/src/assets/paris_bien_etre_small.jpg', latLngBounds, {opacity : 1}).addTo(map);
    // const marker = L.marker([48.879411, 2.290932], {
    //     icon: divIcon,
    // }).addTo(map);
    setTimeout(() => {
        addPie()
    }, 1000)

      console.log(map.value)
    // map.on('zoomend', function() {
    //     const zoom = map.getZoom();
    //     console.log(zoom)
    //     const size = 13*zoom
    //     console.log(divIcon)
    //     document.getElementsByClassName("chart-container")[0].style.width = `${size}px`
    //     document.getElementsByClassName("chart-container")[0].style.height = `${size}px`
    //     console.log(divIcon.options.iconSize)
    // });

})
const pie = ref(null)


const addPie = () => {

  const pie = document.getElementById("pie")

    const ch = new Chart(pie, {
        type: 'pie',
        data: {
            labels: ["At least 1 male and 1 female", "At least 1 female", "No domestic - Boss or employee", "No domestic - Worker"],
            datasets: [{
                label: 'Passy',
                data: [10, 20, 30, 40],
                backgroundColor: ['#cc766e', '#d9ae3c', '#7b9687','#72635d'],
                borderColor: '#000',
                borderWidth: .5
            }],
        },
        
        options: {
          plugins : {
            legend: {
              display: false
            },
          }
        }
    })
}
const zoom = ref(12)
const zoomUpdated = (newZoom) => {
  circleSize.value = 13*newZoom;
  console.log(circleSize.value)
  document.getElementsByClassName("chart-container")[0].style.width = `${circleSize.value}px`
  document.getElementsByClassName("chart-container")[0].style.height = `${circleSize.value}px`
}
      


</script>

<template>
    <!-- <img src="src/assets/paris_bien_etre.jpg" /> -->
    <div id="map-container">
    <l-map ref="map" :zoom="zoom" :center="[48.913749, 2.225493]" @update:zoom="zoomUpdated">
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>
      <l-marker :lat-lng="[48.879411, 2.290932]">
        <l-icon
          :icon-anchor="[200/2, 200/2]"
          class-name="someExtraClass"
        >
          <div class="chart-container">
            <canvas id="pie" ref="pie"></canvas>
          </div>
        </l-icon>
      </l-marker>
    </l-map>
  </div>
</template>

<style>
div {
    color: red;
}

#map-container {
    height: 80vh;
    width: 100vw;
}
.chart-container{
  border: 2px solid red;
  height: 200px;
  transition: width 0.5s, height 0.5s;
}
</style>
