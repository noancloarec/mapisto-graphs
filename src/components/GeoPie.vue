<script setup>
import Chart from 'chart.js/auto';
import { LatLng, Map, Point, map } from "leaflet";
import { computed, defineEmits, defineProps, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';


const props = defineProps({
    /**
     * Identifier for the pie, for technical purposes
     */
    // id: {
    //     type: [String, Number],
    //     required: true
    // },
    /**
     * Latitude and longitude of the center of the pie
     */
    latLng: {
        type: [LatLng, Array],
        required: true
    },
    /**
     * Diameter of the pie in meters.
     * The pie will be resized according to the zoom level of the map
     */
    diameterInMeters: {
        type: Number,
        required: true
    },
    /**
     * Pie data in the format [{label: string, value: number, backgroundColor: string}]
     */
    data: {
        type: Array,
        required: false
    },
    /**
     * Title of the pie
     * e.g. the name of the neighborhood
     */
    title: {
        type: String,
        required: false
    },
    /**
     * Zoom level of the containing map
     */
    zoomLevel: {
        type: Number,
        required: true
    },
    /**
     * Whether the pie can be dragged by the user
     */
    // draggable: {
    //     type: Boolean,
    //     required: true
    // },
    /**
     * Z index offset of the pie.
     * Useful to make the canvas appear on top of potential overlapping canvases
     */
    // zIndexOffset: {
    //     type: Number,
    //     required: true
    // },
    parentMap: {
        type: Map,
        required: true,
    },
    showOnTop: {
        type: Boolean,
        required: false,
    },
    zooming: {
        type: Boolean,
        required: false,
    }
})

const { t } = useI18n()

/**
 * Event emitted when the user drags the pie
 */
defineEmits(['onPositionUpdated'])

// const latLng = new LatLng(props.latLng[0], props.latLng[1])

/**
 * Computes the size of the pie in pixels, based on the zoom level of the map
//  * @see https://gis.stackexchange.com/questions/7430/what-ratio-scales-do-google-maps-zoom-levels-correspond-to
 * @returns 
 */


const getCircleSizeInPixels = () => {
    const metersPerPx = 156543.03392 * Math.cos(props.latLng[0] * Math.PI / 180) / Math.pow(2, props.parentMap.getZoom())
    const size = Math.round(props.diameterInMeters / metersPerPx)
    return size + 300;
}
/**
 * Current circle size in pixels
 */
const circleSizeInPixels = ref(getCircleSizeInPixels())


// let chart = undefined
const pie = ref(null)
/**
 * Draws the pie chart
 */
const drawChart = () => {
    const dest = pie.value.getContext('2d')


    new Chart(dest, {
        type: 'pie',
        data: {
            labels: props.data.map((item) => t(item.label)),
            datasets: [{
                label: props.title,
                data: props.data.map((item) => item.value),
                backgroundColor: props.data.map((item) => item.backgroundColor),
                borderColor: '#00000',
                borderWidth: 0.5,
            }],
        },
        options: {
            rotation: 180,
            plugins: {
                legend: {
                    display: false
                },
            },
            animation: {
                duration: 0
            },
            layout: {
                padding: 150
            },
        }
    });
}
/**
 * Redraws the pie when props are updated to match the new zoom level
 * We should not have to do that but vue-leaflet destroys the canvas whenever props change
 */
const adaptPieSizeAndPosition = () => {
    position.value = props.parentMap.latLngToContainerPoint(props.latLng)
    circleSizeInPixels.value = getCircleSizeInPixels()
}
const position = ref(
    props.parentMap.latLngToContainerPoint(props.latLng)
)

const chartContainer = ref(null)
const mapBeingDragged = ref(false)
onMounted(() => {

    drawChart()
    props.parentMap.on("movestart", () => mapBeingDragged.value = true)
    props.parentMap.on("move", (e) => {
        adaptPieSizeAndPosition()
    })
    props.parentMap.on("moveend", () => {
        mapBeingDragged.value = false
    })
})



</script>

<template>
    <div class="chart-container" ref="chartContainer" :style="{
        width: circleSizeInPixels + 'px',
        height: circleSizeInPixels + 'px',
        top: position.y - circleSizeInPixels / 2 + 'px',
        left: position.x - circleSizeInPixels / 2 + 'px',
        transition: mapBeingDragged ? 'none' : 'all 0.2s',
    }" :class="{ 'do-not-transition': mapBeingDragged, 'show-on-top': showOnTop, 'fade-during-zoom': zooming }">
        <canvas ref="pie"></canvas>
    </div>
</template>

<style scoped>
.chart-container {
    position: absolute;
    z-index: 1000;
    transition: width 0.2s, height 0.2s, top 0.2s, left 0.2s, opacity 0.2s;
    ;
}

.chart-container.do-not-transition {
    transition: none;
}

.chart-container.show-on-top {
    z-index: 1001;
}

.chart-container.fade-during-zoom {
    opacity: 0.1;
}
</style>
```