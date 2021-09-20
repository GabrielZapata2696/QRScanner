import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

declare var mapboxgl;

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit, AfterViewInit {


  lat: number;
  lng: number;

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    let geo: any = this.route.snapshot.paramMap.get('geo');

    geo = geo.substr(4);
    geo = geo.split(',');

    this.lat = +geo[0];
    this.lng = +geo[1];

  }

  ngAfterViewInit() {
    mapboxgl.accessToken = 'pk.eyJ1Ijoic3BhY2VtYW5mcm9taGVsbCIsImEiOiJja3RyeDA2OHUxYXhyMndwMzN0bnVhbjcyIn0.CK7M5zsPtGcpk8klkTWBHw';
    const map = new mapboxgl.Map({
      style: 'mapbox://styles/mapbox/light-v10',
      center: [this.lng, this.lat],
      zoom: 15.5,
      pitch: 45,
      bearing: -17.6,
      container: 'map',
      antialias: true
    });


    map.on('load', () => {
      map.resize();

      const marker1 = new mapboxgl.Marker()
        .setLngLat([this.lng, this.lat])
        .addTo(map);


      // Insert the layer beneath any symbol layer.
      const layers = map.getStyle().layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout['text-field']
      ).id;

      // The 'building' layer in the Mapbox Streets
      // vector tileset contains building height data
      // from OpenStreetMap.
      map.addLayer({

        'id': 'add-3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 15,
        'paint': {
          'fill-extrusion-color': '#aaa',

          // Use an 'interpolate' expression to
          // add a smooth transition effect to
          // the buildings as the user zooms in.
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'height']
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            15,
            0,
            15.05,
            ['get', 'min_height']
          ],
          'fill-extrusion-opacity': 0.6
        }
      },
        labelLayerId
      );
    });




  }

}
