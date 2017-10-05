# j-sanddoc

## 用途简介

网站展示用户发布的富文本内容是一个很常见的需求，但如何在**尽可能提供自由度（包括了对 CSS 的自由使用）的前提下**进行安全过滤，是一个很复杂的工作，尤其是应对老版本 `IE` 浏览器中的 `CSS Expression` （可被 `CSS` 注释语法混淆，以及外部层层引入的 `CSS`）。

本模块基于 `<iframe>` 标签的 `sandbox` 属性（以及老版本 `IE` 中的 `security="restricted"` 属性）解决这个问题。

虽然对性能略有影响，但要兼容性较好而又比较简单地实现充分的 `CSS` 隔离，这也是无奈之举。

这种方案也能完美应对标签未闭合所引发的问题（尤其是考虑到不同浏览器对自闭合标签支持程度不一的情况）。

除了以上考虑，在 `HTML` 语义上，这也是看起来最合理的方案。

本方案主要不适用于存在海量语法简单（尺寸也显然应当受到一定限制）的富文本评论展示的场景下。

## 兼容边界

在早期智能手机不发达的市场环境下，各种“贴心”的“高速”手机浏览器中显示可能不如人意，包括连 `<iframe>` 都不支持的情况。

以及，尚未支持 `sandbox` 属性的非 `IE` 浏览器（虽然这是一种真正匪夷所思的组合，却是真实存在的，有些机房环境赶时髦用了非 `IE` 浏览器，却从不更新它们）。好在这一情况在个人电脑中并不常见，因为作为非原生浏览器，每隔一段时间重装系统后，下载安装的其它浏览器自然也就是最新版了。

当然，如果是连事件监听乃至 `JavaScript` 都不支持的浏览器，更加不可能运行本模块，在此不作赘述。

简单来说，本模块可运行于：

-   `Windows` 电脑上的 `IE` 浏览器的 `6.0` 以上版本
    
-   `Windows` `Mac` 电脑、`Android` `iPhone` 手机等设备上的 `Chrome` `Firefox` `Safari` `Edge` 等现代浏览器的新版本

## 用法示例

```html

<script src="j-sanddoc.js"></script>

<iframe
 sandbox="allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-same-origin"
 frameborder="0"
 marginheight="0"
 marginwidth="0"
 scrolling="no"
 style="width:100%;"
 srcdoc="富文本"
></iframe>

```

## 注意事项

为了尽可能作为一种原生方案的补丁存在（而非另行约定属性标记，例如 `<iframe j-sanddoc>`），减少侵入的痕迹，并避免在模块加载失败的情况下产生安全隐患，本模块采用了纯原始属性校验的方式来甄别一个 `<iframe>` 标签是否是等待其处理的对象。

因此，您必须*严格*（当然“严格”不是“变态”，对书写顺序没有要求）按照上例中的形式来设置您的 `<iframe>` 标签的属性。源代码中的具体判定逻辑实现如下：

```javascript

iFrame.attributes.length===7
&&
!iFrame.src
&&
iFrame.getAttribute('sandbox')
&&
iFrame.getAttribute('sandbox').split(' ').sort().join(' ')===
'allow-popups allow-popups-to-escape-sandbox allow-same-origin allow-top-navigation'
&&
iFrame.getAttribute('frameborder')==='0'
&&
iFrame.getAttribute('marginheight')==='0'
&&
iFrame.getAttribute('marginwidth')==='0'
&&
iFrame.getAttribute('scrolling')==='no'
&&
iFrame.style.width==='100%'
&&
iFrame.getAttribute('srcDoc')

```

您可能注意到，强制 `width` 属性的值为 `100%` 非常像是一条过度的要求，因为很可能需要富文本展示区是别的宽度。

更有甚者，严格限定 `<iframe>` 必须没有边框、边距、拒绝滚动，并且不能存在别的属性，而这些都是不一定的。

这些考虑非常有道理，然而有趣的是，在苹果系统的 `Safari` 浏览器中，对 `<iframe>` 设置高度是无效的，页面一定会完全展开。

这非常糟糕，糟糕的程度和很多时候我们对于 `<iframe>` 能够自适应高度的希望一样强烈。

因此，从最佳实践的角度，永远建议在用于放置富文本的 `<iframe>` 外面再套一层标签，用于实现对宽度、滚动等的个性化设定，乃至其它你所需要的功能，而不要试图在 `<iframe>` 标签上集成这些设置。
