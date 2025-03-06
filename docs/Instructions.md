# Cross-Platform React Native App

We are building a cross-platform app using React Native and deploying it on Web, Android, and iOS.

## Architecture

- **Clean Architecture**
Make sure we stick to clean architecture so that the codebase is readable and scalable

- We use **Context** to provide a theme (light/dark mode support) and make sure it works on all platforms (using the Appearance API to respond to OS theme).
- **Redux**

### Directory Structure - presentation layer

- `components/` for shared UI components 
- `screens/` for screen components
- `navigation/` for routing
- `store/` directory for state management – we choose Redux for global state

## Best Practices

- **Use Responsive Design for Web**:  
  On the web (and even tablets), you have a variety of screen sizes to support. Leverage flexbox and percentage-based widths in your StyleSheets so that layouts can stretch. You can also use utilities like the `useWindowDimensions()` hook to get the window size and adjust UI (e.g., show a sidebar on larger screens). Libraries like Tamagui or React Native Responsive UI can help manage responsive design systematically across native and web.
  
- **Abstract What You Can**:  
  Strive to have the business logic (state management, data fetching, etc.) completely shared and only branch when it comes to input methods or rendering differences. Where possible, write platform-agnostic code. Use the cross-platform components from React Native core or from libraries that support all platforms. For example, use `<TouchableOpacity>` or `<Pressable>` for clickable elements – these work for both mobile (touch) and web (clickable and even support hover events if needed). By using these abstractions, you avoid having divergent code.
  
- **Mind the Web Back Button and URL**:  
  Follow Expo router documentation to implement deep linking and handle back navigation
  
- **Use Universal Packages**:  
  Choose libraries that explicitly support web when possible. See resources like the [React Native Directory website](https://reactnative.directory/) or [LogRocket’s blog](https://blog.logrocket.com).
  
- **Consistent Design Language**:  
  Use a design system or component library that spans platforms. This could even mean your web and mobile have slightly different implementations under the hood, but by keeping the interface the same, your app code doesn’t need to change.

## Performance Optimization

- **Optimize the JavaScript Thread**:  
  Avoid expensive computations on the JS thread during interactions. For instance, heavy data transformations or complex loops should be offloaded – you can use `InteractionManager.runAfterInteractions` to postpone work until UI interactions are done, or move heavy work to a WebWorker (or a native thread via libraries). Also, debouncing or throttling frequent events (like text input `onChange` or scroll events) can reduce JS load.
  
- **Avoid Unnecessary Re-renders**:  
  Use techniques to prevent needless renders:
  - Memoize components with `React.memo` or `PureComponent` so they skip rendering when props haven’t changed.
  - Use `useCallback` and `useMemo` to avoid recreating functions or objects on each render.
  - For lists, always use the `FlatList` or `SectionList` components instead of rendering huge `ScrollViews` – `FlatList` virtualizes the list, meaning it only mounts a window of items and efficiently reuses views outside that window.
  - Provide a stable `keyExtractor` for list items and consider implementing `shouldComponentUpdate` (or using `React.PureComponent`) in complex list items to avoid re-rendering when props haven’t changed.
  
- **Batch Updates and Reduce Bridge Crossings**:  
  A lot of small operations can sometimes be batched to reduce overhead. For example, if you need to update state multiple times in a row, doing it in one `setState` with a combined object or using `unstable_batchedUpdates` can reduce re-renders. Every interaction across the RN bridge has some fixed cost (due to context switching between threads), so try to do more in each batch. For instance, deferring non-essential UI components until after the first render can improve perceived launch performance.
  
- **Enable and Use Hermes**:  
  Hermes is a lightweight JavaScript engine optimized for React Native (open-sourced by Meta). It often provides faster startup times and reduces the memory footprint of RN apps.
  
- **Monitor Memory and Fix Leaks**:  
  Remove timers or listeners in `componentWillUnmount` to avoid memory leaks.

### Handling Animations Efficiently

Smooth animations are a hallmark of a polished app. In React Native, animations can be tricky if done purely on the JavaScript thread (any slowdown in JS may cause dropped frames). The general rule is to offload animations to native whenever possible:

- **Use the Animated API with `useNativeDriver`**:  
  React Native’s built-in Animated library (e.g., `Animated.timing`, `Animated.spring`) allows you to specify `useNativeDriver: true` so that the animation runs entirely on the native UI thread after initial setup.
  
- **Leverage React Native Reanimated**
- **Use LayoutAnimation** for simple global layout changes.
- **Minimize JS Work During Animations**:  
  Use `requestAnimationFrame` for any JS-coupled animations to schedule work at vsync. Ideally, once an animation starts, let it run independent of JS. Avoid heavy computations in an animation loop. If an animation needs frequent JS callbacks (for state updates, for instance), consider if these updates are needed every frame.
  
- **Throttle Gestures Handling**:  
  For rapid gesture events (like a pan gesture), consider using libraries like `react-native-gesture-handler`.

### Reducing Bundle Size and Optimizing Loading

- **Tree Shaking and Dead Code Elimination**:  
  Metro (React Native’s bundler) doesn’t tree-shake as aggressively as Webpack due to module structure. Ensure you’re not importing huge libraries or unnecessary modules.
  
- **Hermes and Bytecode Preloading**:  
  With Hermes, your JS bundle is compiled to bytecode which is typically smaller than plain JS (after compression) and loads faster.
  
- **Code Splitting**:  
  Although not as straightforward in RN as on the web, you can manually split code using dynamic imports. For example, load certain screens only after login.
  
- **Compress Images and Assets**:  
  Large images can bloat an app. Use appropriate resolutions and compression. The asset system in RN bundles images, or you can use libraries like `react-native-fast-image` for network loading with caching. For vector graphics, consider SVGs (via `react-native-svg`) instead of large PNGs.
  
- **Remove Unused Native Modules**:  
  When using Expo, consider the bare workflow to trim out native modules you don’t need.
  
- **Minify JS in Release**:  
  Ensure that Metro minifies JS in release builds – this reduces bundle size by shortening variable names and removing comments.
  
- **Lazy Load Components**:  
  Lazy load screens or components that aren’t immediately needed. React Navigation offers options to mount screens only when navigated to, which keeps the initial render lean.
  
- **Optimize JavaScript Code**:  
  Use efficient algorithms for data processing and be mindful of memory leaks. Offload heavy tasks to native code or a WebWorker if necessary, ensuring that the UI thread remains responsive.

### Native Modules for Performance-Heavy Tasks

- **Complex Computations**:  
  For heavy math, data crunching, image processing, or encryption, JavaScript may be too slow. Offloading such tasks to a native module (or shared C++ library) can utilize multiple cores or simply run much faster.
  
- **Background Threading**:  
  Native modules allow you to spawn background threads, enabling parallel processing without blocking the main UI. With JSI, you can even call C++ code directly.
  
- **Leverage Existing Optimized Libraries**:  
  If there’s an optimized native library for a specific function (e.g., a high-performance video decoder or machine learning inference), consider writing a native module wrapper for it.
  
- **Large Data Transfer**:  
  Transferring large amounts of data between JS and native can be a bottleneck. The new JSI approach minimizes overhead by sharing data without JSON serialization.
  
  With JSI, you can write TurboModules that appear as regular JS objects but execute native code directly—ideal for computationally intensive tasks like cryptographic hashing.
  
- **Note**:  
  While native modules reduce overhead, they add platform-specific complexity. Use them only where performance gains justify the extra maintenance.

## Tech Stack

- [React Native](https://reactnative.dev/docs/getting-started)
- [Expo](https://docs.expo.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox) (to ensure responsive styles)
- [Supabase](https://supabase.com/docs/reference/javascript/introduction)