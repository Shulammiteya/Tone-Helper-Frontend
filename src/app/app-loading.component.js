import React from 'react';
import ExpoAppLoading from 'expo-app-loading';
import * as SplashScreen from 'expo-splash-screen';

/**
 * Loads application configuration and returns content of the application when done.
 *
 * @property {Task[]} tasks - Array of tasks to prepare application before it's loaded.
 * A single task should return a Promise with value and a by which this value is accessible.
 *
 * @property {LoadableConfiguration} initialConfig - Configuration to use by default.
 * May be useful at first run.
 *
 * @property {(props: { loaded: boolean }) => React.ReactElement} placeholder - Element to render
 * while application is loading.
 *
 * @property {(config: LoadableConfiguration) => React.ReactElement} children - Should return Application component
 */

export const AppLoading = (props) => {

  const [loading, setLoading] = React.useState(true);
  const loadingResult = React.useRef(props.initialConfig || {});

  const onTasksFinish = () => {
    setLoading(false);
    SplashScreen.hideAsync();
  };

  const saveTaskResult = (result) => {
    if (result) {
      loadingResult.current[result[0]] = result[1];
    }
  };

  const startTasks = () => {
    return Promise.all(props.tasks.map(task => task().then(saveTaskResult)))
    .then();
  };

  const renderLoadingElement = () => (
    <ExpoAppLoading
      autoHideSplash={false}
      startAsync={startTasks}
      onFinish={onTasksFinish}
      onError={console.error}
    />
  );

  return (
    <>
      {loading ? renderLoadingElement() : props.children(loadingResult.current)}
      {props.placeholder && props.placeholder({ loading })}
    </>
  );
};

AppLoading.defaultProps = {
  tasks: [],
  initialConfig: {},
};
