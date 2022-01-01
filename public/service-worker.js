// importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.0.2/workbox-sw.js');

// workbox.routing.registerRoute(
//   ({request}) => {
//     return new RegExp('https:.*\.(css|js|json|wasm|html|map|)').test(request.url);
//   },
//   new workbox.strategies.StaleWhileRevalidate()
// )

// workbox.routing.registerRoute(
//     ({request}) => {
//       return request.destination === 'image';
//     },
//     new workbox.strategies.CacheFirst({
//       cacheName: 'images',
//       plugins: [
//         new workbox.cacheableResponse.CacheableResponsePlugin({
//           statuses: [0, 200],
//         }),
//         new workbox.expiration.ExpirationPlugin({
//           maxEntries: 60,
//           maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
//         }),
//       ],
//     }),
// );

// // Cache Google Fonts with a stale-while-revalidate strategy, with
// // a maximum number of entries.
// workbox.routing.registerRoute(
// ({url}) => url.origin === 'https://fonts.googleapis.com' ||
//             url.origin === 'https://fonts.gstatic.com',
// new workbox.strategies.StaleWhileRevalidate({
//     cacheName: 'google-fonts',
//     plugins: [
//     new workbox.expiration.ExpirationPlugin({maxEntries: 20}),
//     ],
// }),
// );

