/* 自毁 Service Worker：清理一切本地缓存并注销自身 */
self.addEventListener('install', function () { self.skipWaiting(); });

self.addEventListener('activate', function (event) {
  event.waitUntil((async function () {
    // 1) 删除全部缓存
    var keys = await caches.keys();
    await Promise.all(keys.map(function (k) { return caches.delete(k); }));
    // 2) 收集受控页面
    var clients = await self.clients.matchAll({ type: 'window' });
    // 3) 注销自己
    try { await self.registration.unregister(); } catch (e) {}
    // 4) 强制这些页面重新加载（此时已无缓存，将走网络，看到占位页）
    clients.forEach(function (c) {
      try {
        var u = c.url.split('#')[0];
        c.navigate(u + (u.indexOf('?') > -1 ? '&' : '?') + 'gone=1');
      } catch (e) {}
    });
  })());
});
