
<script setup>
import L from "leaflet";
import { LMap, LTileLayer ,LMarker, LIcon, LImageOverlay} from "@vue-leaflet/vue-leaflet";
import Chart from 'chart.js/auto';
import "leaflet/dist/leaflet.css";

import { onMounted, reactive, ref, watch } from "vue";
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

// watch([pie, zoom], ([a, b], [oldA, olB]) => {
//     console.log({a, b, oldA, olB})
//     console.log(a.isSameNode(oldA))
//     console.log(a?.toDataURL())
// })
let canvases = []
setInterval(() => {
  const newCanvases = Array.from(document.querySelectorAll("canvas"))
  for(let i = 0; i < canvases.length; i++) {
    if(!canvases[i].isSameNode(newCanvases[i])) {
        console.log(newCanvases[i].toDataURL())
        console.log(canvases[i].toDataURL())
    }
  }
  canvases = newCanvases

}, 1000)

const makeHtml = () => {
    return `<div class="chart-container"><canvas id="pie"></canvas></div>`
}

const staticAnchor = reactive([100, 100])
const customText = ref("Hello World")
const data = reactive({
            labels: ["At least 1 male and 1 female", "At least 1 female", "No domestic - Boss or employee", "No domestic - Worker"],
            datasets: [{
                label: 'Passy',
                data: [10, 20, 30, 40],
                backgroundColor: ['#cc766e', '#d9ae3c', '#7b9687','#72635d'],
                borderColor: '#000',
                borderWidth: .5
            }],
        })


</script>

<template>
    <!-- <img src="src/assets/paris_bien_etre.jpg" /> -->
    <div style="height:600px; width:800px">
    <l-map ref="map" v-model:zoom="zoom" :center="[48.913749, 2.225493]">
      <l-tile-layer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        layer-type="base"
        name="OpenStreetMap"
      ></l-tile-layer>
      <l-marker :lat-lng="[48.879411, 2.290932]">
        <l-icon
          :icon-anchor="[100, 100]"
          :icon-size="[200, 200]"
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
}
</style>
