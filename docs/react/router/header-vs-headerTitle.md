# React Navigation 中 header 与 headerTitle 的区别

> 深入解析 React Navigation 6+ 中导航选项的两种 Header 配置方式

---

## 概述

在 React Navigation 中配置导航栏时，你可能会看到两种不同的属性：

- `header` — 接收一个 **React 组件**，允许完全自定义导航栏的外观和行为
- `headerTitle` — 接收一个 **字符串**，用于设置导航栏的标题文本

虽然两者都可以用来在导航栏中显示内容，但它们有着本质的区别和各自最佳的使用场景。

---

## 核心区别

### `headerTitle` — 简单字符串

```tsx
// ✅ 正确用法
const Stack = createNativeStackNavigator();

function HomeScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          // headerTitle 接收字符串，直接显示为标题
          headerTitle: "个人中心",
        }}
      />
    </Stack.Navigator>
  );
}
```

`headerTitle` 是最简单的方式，它只接受一个字符串作为导航栏的标题。底层会被渲染为一个 `<Text>` 组件。

### `header` — 自定义 React 组件

```tsx
// ✅ 正确用法
const Stack = createNativeStackNavigator();

function CustomHeader({ title }) {
  return (
    <View style={{ height: 60, backgroundColor: '#4A90E2', justifyContent: 'center', paddingHorizontal: 16 }}>
      <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>{title}</Text>
    </View>
  );
}

function HomeScreen() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          // header 接收一个 React 组件，完全控制导航栏
          header: (props) => <CustomHeader title="个人中心" {...props} />,
        }}
      />
    </Stack.Navigator>
  );
}
```

当你使用 `header` 时，React Navigation 会**完全替换**默认的导航栏为你提供的自定义组件。

---

## 何时使用 `headerTitle`

### 适用场景

| 场景 | 说明 |
|------|------|
| 静态标题 | 标题是简单文本，不需要额外样式或交互 |
| 统一风格 | 使用 React Navigation 默认的导航栏样式 |
| 快速开发 | 不需要复杂的导航栏定制，只需显示文字 |

### 示例：静态标题

```tsx
<Stack.Screen
  name="Settings"
  component={SettingsScreen}
  options={{
    headerTitle: "设置",
  }}
/>
```

### 示例：动态标题

```tsx
function UserProfileScreen({ route }) {
  const { userId } = route.params;

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="UserProfile"
        component={UserProfileContent}
        options={({ route }) => ({
          // 支持动态标题
          headerTitle: `用户 ${route.params.userId}`,
        })}
      />
    </Stack.Navigator>
  );
}
```

---

## 何时使用 `header`

### 适用场景

| 场景 | 说明 |
|------|------|
| 复杂布局 | 导航栏需要图标、按钮、搜索框等复杂元素 |
| 自定义样式 | 需要与 App 整体风格完全一致的导航栏 |
| 交互功能 | 导航栏需要响应点击、滚动等事件 |
| 动态内容 | 导航栏内容依赖于业务逻辑状态 |

### 示例：带操作按钮的导航栏

```tsx
function HeaderWithActions({ title, onShare, onFavorite }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onShare}>
          <Text>分享</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onFavorite}>
          <Text>收藏</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 使用
<Stack.Screen
  name="Article"
  component={ArticleScreen}
  options={{
    header: (props) => (
      <HeaderWithActions
        title="文章标题"
        onShare={() => console.log('分享')}
        onFavorite={() => console.log('收藏')}
      />
    ),
  }}
/>
```

### 示例：带搜索框的导航栏

```tsx
function SearchHeader() {
  const [searchText, setSearchText] = React.useState('');

  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="搜索..."
        value={searchText}
        onChangeText={setSearchText}
      />
      <TouchableOpacity style={styles.searchButton}>
        <Text>搜索</Text>
      </TouchableOpacity>
    </View>
  );
}

<Stack.Screen
  name="Search"
  component={SearchScreen}
  options={{
    header: SearchHeader,
  }}
/>
```

### 示例：品牌化导航栏

```tsx
function BrandHeader() {
  return (
    <View style={brandStyles.header}>
      <Image source={require('./logo.png')} style={brandStyles.logo} />
      <Text style={brandStyles.brandName}>MyApp</Text>
    </View>
  );
}
```

---

## 高级用法

### 结合 `headerTitle` 和其他属性

```tsx
<Stack.Screen
  name="Dashboard"
  component={DashboardScreen}
  options={{
    // 设置标题
    headerTitle: "控制台",
    // 设置背景色
    headerStyle: {
      backgroundColor: '#4A90E2',
    },
    // 设置文字颜色
    headerTintColor: '#FFF',
    // 添加阴影
    headerShadowVisible: true,
    // 设置标题样式
    headerTitleStyle: {
      fontWeight: 'bold',
    },
  }}
/>
```

### 使用 `headerTitleAlign` 控制标题对齐

```tsx
<Stack.Screen
  name="CenteredTitle"
  component={CenteredTitleScreen}
  options={{
    headerTitle: "居中标题",
    // React Navigation 6+ 支持
    headerTitleAlign: 'center',
  }}
/>
```

### 父子 Navigator 共享 Header 配置

```tsx
// 父级设置全局 header
const Stack = createStackNavigator();

function RootStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4A90E2',
        },
        headerTintColor: '#FFF',
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}

// 子屏幕可以覆盖 header 配置
function ProfileScreen({ navigation }) {
  return (
    <Stack.Navigator>
      {/* 覆盖父级的 headerStyle */}
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          headerStyle: {
            backgroundColor: '#FF6B6B',
          },
          header: (props) => <CustomHeader {...props} />,
        }}
      />
    </Stack.Navigator>
  );
}
```

---

## 常见错误与解决方案

### ❌ 错误一：将组件传给 `headerTitle`

```tsx
// ❌ 错误：headerTitle 只能接收字符串
<Stack.Screen
  name="Home"
  component={HomeScreen}
  options={{
    headerTitle: <CustomComponent />, // 错误！
  }}
/>

// ✅ 正确：使用 header 传入组件
<Stack.Screen
  name="Home"
  component={HomeScreen}
  options={{
    header: (props) => <CustomHeader {...props} />,
  }}
/>
```

### ❌ 错误二：在 `header` 中忘记传递 props

```tsx
// ❌ 错误：自定义 header 没有接收 Navigation props
<Stack.Screen
  name="Home"
  component={HomeScreen}
  options={{
    header: <CustomHeader />, // 缺少 props！
  }}
/>

// ✅ 正确：接收并使用 navigation, route 等 props
<Stack.Screen
  name="Home"
  component={HomeScreen}
  options={{
    header: (props) => <CustomHeader {...props} />,
  }}
/>

// CustomHeader 可以这样接收 props：
function CustomHeader({ navigation, route, options, back }) {
  return (
    <View>
      {back && <TouchableOpacity onPress={() => navigation.goBack()}>返回</TouchableOpacity>}
      <Text>{route.name}</Text>
    </View>
  );
}
```

### ❌ 错误三：`header` 和 `headerTitle` 混用导致冲突

```tsx
// ❌ 不推荐：同时使用两者
<Stack.Screen
  name="Home"
  component={HomeScreen}
  options={{
    headerTitle: "首页",        // 可能被忽略
    header: CustomHeader,       // header 优先级更高
  }}
/>

// ✅ 推荐：明确选择其一
<Stack.Screen
  name="Home"
  component={HomeScreen}
  options={{
    header: (props) => <CustomHeader title="首页" {...props} />,
  }}
/>
```

---

## 与 Native Stack Navigator 的特殊说明

`createNativeStackNavigator` 中的 `header` 属性有一些特定行为：

### iOS 风格导航栏

```tsx
const NativeStack = createNativeStackNavigator();

function NativeStackExample() {
  return (
    <NativeStack.Navigator>
      <NativeStack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          // 原生导航栏的 largeTitle 支持（iOS）
          headerLargeTitle: true,
          headerLargeTitleStyle: {
            fontWeight: 'bold',
          },
          // 配合 headerTitle 使用
          headerTitle: "首页",
        }}
      />
    </NativeStack.Navigator>
  );
}
```

### 自定义原生导航栏

```tsx
// 使用 header 自定义原生导航栏的某些部分
<NativeStack.Screen
  name="Custom"
  component={CustomScreen}
  options={{
    // 完全替换原生导航栏
    header: (props) => <FullyCustomHeader {...props} />,
    // 或者只替换标题区域
    headerTitle: (props) => <CustomTitle {...props} />,
  }}
/>
```

---

## 最佳实践总结

```
┌─────────────────────────────────────────────────────────────┐
│                     选择决策树                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  需要显示文本标题？                                          │
│       │                                                     │
│       ├── 是 → 只需要简单文本？                              │
│       │         ├── 是 → 使用 headerTitle                    │
│       │         └── 否 → 需要自定义样式/交互？                │
│       │                   ├── 是 → 使用 header               │
│       │                   └── 否 → 使用 headerTitle + 其他选项│
│       │                                                     │
│       └── 否 → 需要复杂布局/图标/按钮？                       │
│                 └── 使用 header                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 实践建议

1. **优先使用 `headerTitle`** — 当只需要显示标题时，保持配置简单
2. **使用 `header` 进行自定义** — 需要完整控制导航栏时使用
3. **提取可复用组件** — 多个屏幕需要相似导航栏时，抽取为共享组件
4. **关注 props** — 自定义 `header` 组件记得接收 Navigation props
5. **保持一致性** — 在同一个 App 中保持导航栏风格统一
6. **测试不同平台** — iOS 和 Android 的导航栏行为可能略有不同

---

## 进阶：使用 React Navigation 6+ 的 useLayoutEffect 动态更新

```tsx
function ProfileScreen({ navigation, route }) {
  const [isEditing, setIsEditing] = React.useState(false);

  // 动态更新 header 配置
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: isEditing ? '编辑资料' : '个人资料',
      headerRight: () => (
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <Text>{isEditing ? '完成' : '编辑'}</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, isEditing]);

  return <ProfileContent isEditing={isEditing} />;
}
```

---

## 参考资源

- [React Navigation 官方文档](https://reactnavigation.org/docs/headers)
- [Native Stack Navigator](https://reactnavigation.org/docs/native-stack-navigator)
- [Stack Navigator](https://reactnavigation.org/docs/stack-navigator)

---

> 📝 **更新记录**
> - 2024-01-15：初始版本
> - 兼容 React Navigation 6.x / 7.x
