import "maplibre-gl/dist/maplibre-gl.css";
import "./style.css";
import maplibregl from "maplibre-gl";
import * as pmtiles from "pmtiles";

const ui = {
  map: document.getElementById("map"),
  loading: document.getElementById("loading"),
  error: document.getElementById("error"),
  info: document.getElementById("info"),
  modal: document.getElementById("modal"),
  modalContent: document.getElementById("modal-content"),
  closeModal: document.getElementById("close-modal"),
  search: document.getElementById("search-button"),
  searchInput: document.getElementById("search-input"),
  reset: document.getElementById("reset"),
  imagery: document.getElementById("selected-imagery"),
}

function map() {
  let protocol = new pmtiles.Protocol();
  maplibregl.addProtocol("pmtiles", protocol.tile);
  fetch("style.json").then((response) => {
    response.json().then((style) => {
      const map = new maplibregl.Map({
        container: "map",
        name: "Jackson County locations",
        hash: true,
        zoom: 10.66,
        center: [-84.0183, 37.4145],
        maxZoom: 22,
        maxPitch: 85,
        attributionControl: false,
        maxBounds: [
          [-124.848974, 24.396308], // Southwest coordinates (California, Florida)
          [-66.885444, 49.384358]   // Northeast coordinates (Maine, Minnesota)
        ],
        style: style
      });

      map.on("load", function (e) {

        map.setSky({
          'sky-color': "skyblue",
          'sky-horizon-blend': 1,
          'horizon-color': "whitesmoke",
          'horizon-fog-blend': 0,
          'fog-color': "whitesmoke",
          'fog-ground-blend': 0,
        });

      });

      map.addControl(
        new maplibregl.AttributionControl({
          compact: true,
          customAttribution: "KyFromAbove, UKy Geography, &copy; OSM contributors",
        })
      );

      map.addControl(
        new maplibregl.NavigationControl({
          visualizePitch: true,
          showZoom: true,
          showCompass: true,
        })
      );

      const geolocate = new maplibregl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      });
      map.addControl(geolocate);

      geolocate.on("geolocate", function (e) {
        // console.log("Geolocated at: ", e.coords);
        const lat = e.coords.latitude;
        const lng = e.coords.longitude;
      });

      map.addControl(new maplibregl.FullscreenControl());

      map.addControl(
        new maplibregl.ScaleControl({
          maxWidth: 80,
          unit: "imperial",
        })
      );

      map.addControl(
        new maplibregl.TerrainControl({
          source: "terrainSource",
          exaggeration: 2,
        })
      );

      map.on("click", "obliques-north", (e) => {
        map.setLayoutProperty('obliques-south-images', 'visibility', 'none');
        if (e.features.length > 0) {
          const coordinates = e.features[0].geometry.coordinates;
          const props = e.features[0].properties;
          const id = props.ShotID.split("_")
          const selected = props.OBJECTID;
          map.setFilter("selected-plane", ["==", ["get", "OBJECTID"], selected]);
          map.setLayoutProperty('selected-plane', 'visibility', 'visible');

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(buildPopupContent(e))
            .addTo(map);

          map.setLayoutProperty('obliques-north-images', 'visibility', 'visible');
          const shotIds = [
            `Fwd_${id[1]}_${id[2]}`,
            `Bwd_${id[1]}_${id[2]}`,
            `Left_${id[1]}_${id[2]}`,
            `Right_${id[1]}_${id[2]}`
          ];
          map.setFilter("obliques-north-images", ["in", ["get", "ShotID"], ["literal", shotIds]]);
          map.flyTo({
            center: coordinates,
            zoom: 12.5,
            speed: 0.5,
            curve: 1,
            essential: true // this animation is considered essential with respect to prefers-reduced-motion
          });
        }



      });

      map.on("click", "obliques-south", (e) => {
        map.setLayoutProperty('obliques-north-images', 'visibility', 'none');
        if (e.features.length > 0) {
          const coordinates = e.features[0].geometry.coordinates;
          const props = e.features[0].properties;
          const id = props.ShotID.split("_")
          const selected = props.OBJECTID;
          map.setFilter("selected-plane", ["==", ["get", "OBJECTID"], selected]);
          map.setLayoutProperty('selected-plane', 'visibility', 'visible');


          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(buildPopupContent(e))
            .addTo(map);

          map.setLayoutProperty('obliques-south-images', 'visibility', 'visible');
          const shotIds = [
            `Fwd_${id[1]}_${id[2]}`,
            `Bwd_${id[1]}_${id[2]}`,
            `Left_${id[1]}_${id[2]}`,
            `Right_${id[1]}_${id[2]}`
          ];
          map.setFilter("obliques-south-images", ["in", ["get", "ShotID"], ["literal", shotIds]]);
          map.flyTo({
            center: coordinates,
            zoom: 12.5,
            speed: 0.5,
            curve: 1,
            essential: true // this animation is considered essential with respect to prefers-reduced-motion
          });
        }

      });

      map.on("click", "obliques-south-images", (e) => {
        // map.setLayoutProperty('obliques-north-images', 'visibility', 'none');
        if (e.features.length > 0) {
          const coordinates = e.features[0].geometry.coordinates;
          const props = e.features[0].properties;
          // console.log(props)
          const id = props.ShotID
          const direction = props.CameraID === "Fwd" ? "Forward" : props.CameraID === "Bwd" ? "Backward" : props.CameraID === "Left" ? "Left" : "Right";

          const popup = `<div class="text-2xl mb-2">${direction}</div>
        <a class="text-lg" href="${props.S3URL}">${id}.tif</a>`;

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(popup)
            .addTo(map);
        }

      });

      map.on("click", "obliques-north-images", (e) => {
        // map.setLayoutProperty('obliques-north-images', 'visibility', 'none');
        if (e.features.length > 0) {
          const coordinates = e.features[0].geometry.coordinates;
          const props = e.features[0].properties;
          // console.log(props)
          const id = props.ShotID
          const direction = props.CameraID === "Fwd" ? "Forward" : props.CameraID === "Bwd" ? "Backward" : props.CameraID === "Left" ? "Left" : "Right";

          const popup = `<div class="text-2xl mb-2">${direction}</div>
        <a class="text-lg" href="${props.S3URL}">${id}.tif</a>`;

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(popup)
            .addTo(map);
        }

      });

      map.on("click", "selected-plane", (e) => {
        // map.setLayoutProperty('obliques-north-images', 'visibility', 'none');
        if (e.features.length > 0) {
          const coordinates = e.features[0].geometry.coordinates;
          const props = e.features[0].properties;
          // console.log(props)
          const id = props.ShotID


          const popup = `<div class="text-2xl mb-2">Nadir</div>
        <a class="text-lg" href="${props.S3URL}">${id}.tif</a>`;

          new maplibregl.Popup()
            .setLngLat(coordinates)
            .setHTML(popup)
            .addTo(map);
        }

      });

      ui.search.addEventListener("click", () => {
        let searchTerm = ui.searchInput.value.trim();
        const id = searchTerm.split("_");
        if (id.length == 2) {
          const search = `Color_${id[0]}_${id[1]}`;
          const shotIds = [
            `Fwd_${id[0]}_${id[1]}`,
            `Bwd_${id[0]}_${id[1]}`,
            `Left_${id[0]}_${id[1]}`,
            `Right_${id[0]}_${id[1]}`
          ];
          map.setFilter("obliques-south-images", ["in", ["get", "ShotID"], ["literal", shotIds]]);
          map.setFilter("obliques-north-images", ["in", ["get", "ShotID"], ["literal", shotIds]]);
          map.setFilter("selected-plane", ["==", ["get", "ShotID"], search]);
          map.setLayoutProperty("selected-plane", "icon-allow-overlap", true);
          map.setLayoutProperty("obliques-north", "visibility", "none");
          map.setLayoutProperty("obliques-south", "visibility", "none");
          map.setLayoutProperty("obliques-south-images", "visibility", "visible");
          map.setLayoutProperty("obliques-north-images", "visibility", "visible");
          map.setLayoutProperty("selected-plane", "visibility", "visible");

          const images = map.querySourceFeatures("on-points", {
            sourceLayer: 'centroids'
          });
          const flights = images.map((image) => {
            if (image.properties.FL == id[0]) {
              return image
            }
            return null
          })
          const shot = flights.filter((flight) => flight !== null);
          const img = shot.map((flight) => {
            const shotId = flight.properties.ShotID.split("_");
            const cam = flight.properties.CameraID;
            if (shotId[1] == id[0] && shotId[2] == id[1] && cam == "Color") {
              searchTerm = flight.properties.OBJECTID;
              // console.log("Found shot: ", flight);
              // map.setFilter("selected-plane", ["==", ["get", "OBJECTID"], searchTerm]);
              // map.setLayoutProperty("selected-plane", "icon-allow-overlap", true);
              // map.setLayoutProperty("obliques-south-images", "visibility", "none");
              // map.setLayoutProperty("obliques-north-images", "visibility", "none");
              // map.setFilter("obliques-south-images", ["==", ["get", "OBJECTID"], searchTerm]);
              // map.setFilter("obliques-north-images", ["==", ["get", "OBJECTID"], searchTerm]);
              // map.setLayoutProperty("selected-plane", "visibility", "visible");
              // map.setLayoutProperty("obliques-south-images", "visibility", "visible");
              // map.setLayoutProperty("obliques-north-images", "visibility", "visible");
              map.flyTo({
                center: flight.geometry.coordinates,
                zoom: 15,
                speed: 0.5,
                curve: 1,
                essential: true // this animation is considered essential with respect to prefers-reduced-motion
              });
            }
            if (shotId[1] == id[0] && shotId[2] == id[1]) {
              return flight;
            }
            return false;
            // if (flight) {
            //   console.log("Images: ", images, flights);
            //   searchTerm += ""
            //   map.setFilter("selected-plane", ["==", ["get", "FL"], searchTerm]);
            //   // map.setLayoutProperty("selected-plane", "visibility", "visible");
            // }
          })

          ui.reset.addEventListener("click", () => {
            map.setFilter("obliques-south-images", null);
            map.setFilter("obliques-north-images", null);
            map.setFilter("selected-plane", null);
            map.setLayoutProperty("selected-plane", "visibility", "none");
            map.setLayoutProperty("obliques-south-images", "visibility", "none");
            map.setLayoutProperty("obliques-north-images", "visibility", "none");
            map.setLayoutProperty("obliques-north", "visibility", "visible");
            map.setLayoutProperty("obliques-south", "visibility", "visible");
          }
          );

          map.on("error", (e) => {
            console.error("Map error: ", e);
          });

        }
      })
    })
  });
}

function buildPopupContent(e) {
  const props = e.features[0].properties;
  const date = new Date(props.FlightDate).toLocaleDateString();
  const season = props.Season;
  const year = props.Year;
  const id = props.ShotID.split("_")
  const color = `KY_KYAPED_${year}_Season${season}_3IN/Color_${id[1]}_${id[2]}.tif`;
  const fwd = `KY_KYAPED_${year}_Season${season}_3IN/Fwd_${id[1]}_${id[2]}.tif`;
  const bwd = `KY_KYAPED_${year}_Season${season}_3IN/Bwd_${id[1]}_${id[2]}.tif`;
  const left = `KY_KYAPED_${year}_Season${season}_3IN/Left_${id[1]}_${id[2]}.tif`;
  const right = `KY_KYAPED_${year}_Season${season}_3IN/Right_${id[1]}_${id[2]}.tif`;
  const base = 'https://kyfromabove.s3.amazonaws.com/imagery/obliques/Phase3/'
  const popup1 = `<div class="text-2xl mb-2 mt-2 ">File downloads</div>
  <div class="text-xl mb-2 mt-2 ">KY_KYAPED_${year}_Season${season}_3IN</div>
            Forward: <a href="${base}${fwd}" >Fwd_${id[1]}_${id[2]}.tif</a><br>
            Backward: <a href="${base}${bwd}">Bwd_${id[1]}_${id[2]}.tif</a><br>
            Left: <a href="${base}${left}">Left_${id[1]}_${id[2]}.tif</a><br>
            Right: <a href="${base}${right}" >Right_${id[1]}_${id[2]}.tif</a><br>
            Nadir: <a href="${base}${color}" >Color_${id[1]}_${id[2]}.tif</a><br>
            `
  const popup = `
  <div class="text-2xl mb-2">${date} ${props.FlightTime}</div>
  <div class="text-lg mb-4">Flight: ${id[1]}<br>
  Shot: ${id[2]}<br>
  ID: ${id[1]}_${id[2]}</div>
  `

  ui.imagery.innerHTML = `${popup} ${popup1}`;
  return popup;
}

function buildUI() {



  ui.info.addEventListener("click", () => {
    ui.modal.style.display = "block";
  });
  ui.closeModal.addEventListener("click", () => {
    ui.modal.style.display = "none";
  });

}

document.addEventListener("DOMContentLoaded", () => {
  map();
  buildUI();
}
);