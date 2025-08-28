import React, { useEffect, useMemo, useReducer, useState } from "react";
import "./App.css";
import YouTubePlayer from "./YouTubePlayer";
import MusicSelector from "./MusicSelector";
import Modal from "./Modal";

const musicPresets = [
  { name: "lofi hip hop radio 📚", videoId: "jfKfPfyJRdk" },
  { name: "jazz lofi radio 🎷", videoId: "HuFYqnbVbzY" },
  { name: "Calm Meditation Music 🙏", videoId: "inpok4MKVLM" },
  { name: "Classic Music 🎹", videoId: "bwZUs26HZI8" },
  { name: "음악 없음", videoId: null },
];

const settingConfigs = {
  sets: { label: "SET", min: 1, max: 30, step: 1 },
  workTime: { label: "WORK OUT", min: 5, max: 1800, step: 5 },
  restTime: { label: "REST", min: 0, max: 1800, step: 5 },
};

const initialState = {
  // 설정 값
  sets: 3,
  workTime: 25,
  restTime: 10,
  // 타이머 상태
  currentSet: 1,
  currentTime: 25, // 시작 시 workTime으로 설정됨
  isWorking: true, // true: 운동, false: 휴식
  isActive: false, // 타이머 활성화 여부
  isFinished: false, // 운동 완료 여부
};

function reducer(state, action) {
  switch (action.type) {
    case "TICK":
      return { ...state, currentTime: state.currentTime - 1 };
    case "START_PAUSE":
      // 처음 시작할 때 isFinished 상태를 초기화
      if (!state.isActive) {
        return { ...state, isActive: true, isFinished: false };
      }
      return { ...state, isActive: !state.isActive };
    case "NEXT_PHASE":
      // 운동에서 휴식으로 전환
      if (state.isWorking) {
        return { ...state, isWorking: false, currentTime: state.restTime };
      }
      // 휴식에서 운동으로 전환
      else {
        // 마지막 세트의 휴식이 끝났으면 종료
        if (state.currentSet >= state.sets) {
          return {
            ...initialState,
            sets: state.sets,
            workTime: state.workTime,
            restTime: state.restTime,
            currentTime: state.workTime,
            isFinished: true, // 완료 상태로 변경
          };
        }
        // 다음 운동으로
        return {
          ...state,
          isWorking: true,
          currentSet: state.currentSet + 1,
          currentTime: state.workTime,
        };
      }
    case "RESET":
      return {
        ...initialState,
        // 사용자 설정은 유지
        sets: state.sets,
        workTime: state.workTime,
        restTime: state.restTime,
        currentTime: state.workTime,
      };
    case "ACKNOWLEDGE_FINISH":
      return { ...state, isFinished: false };
    case "SET_SETTING": {
      const { name, value } = action.payload;
      const newState = { ...state, [name]: value };
      // 타이머가 멈춰있을 때 운동 시간을 바꾸면 현재 시간도 업데이트
      if (name === "workTime" && !state.isActive) {
        newState.currentTime = value;
      }
      return newState;
    }
    default:
      return state;
  }
}

function App() {
  const [selectedVideoId, setSelectedVideoId] = useState(
    musicPresets[0].videoId
  );
  const [selectedVideoTitle, setSelectedVideoTitle] = useState(
    musicPresets[0].name
  );
  const [modalState, setModalState] = useState({
    isOpen: false,
    setting: null,
    tempValue: 0,
  });

  const [state, dispatch] = useReducer(reducer, initialState);
  const {
    sets,
    workTime,
    restTime,
    currentSet,
    currentTime,
    isWorking,
    isActive,
    isFinished,
  } = state;

  const headerClassNames = ["App-header"];
  if (isActive) {
    if (isWorking) {
      headerClassNames.push("workout-bg");
    } else {
      headerClassNames.push("rest-bg");
    }
  }

  // 총 운동 시간 계산 (useMemo로 최적화)
  const totalWorkoutTime = useMemo(() => {
    if (sets <= 0) return 0;
    // 각 세트의 운동과 휴식을 모두 포함하여 계산
    return (workTime + restTime) * sets;
  }, [sets, workTime, restTime]);

  // 타이머  TICK 로직
  useEffect(() => {
    let interval = null;
    if (isActive && currentTime > 0) {
      interval = setInterval(() => {
        dispatch({ type: "TICK" });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, currentTime]);

  // 시간이 0이 되었을 때 상태 전환 로직
  useEffect(() => {
    if (currentTime === 0 && isActive) {
      dispatch({ type: "NEXT_PHASE" });
    }
  }, [currentTime, isActive]);

  // 운동 종료 시 알림
  useEffect(() => {
    if (isFinished) {
      alert("Workout Complete!");
      dispatch({ type: "ACKNOWLEDGE_FINISH" });
    }
  }, [isFinished]);

  const handleStartPause = () => {
    dispatch({ type: "START_PAUSE" });
  };

  const handleReset = () => {
    dispatch({ type: "RESET" });
  };

  const handleSkipToRest = () => {
    dispatch({ type: "NEXT_PHASE" });
  };

  const handleSettingChange = (e) => {
    const { name, value } = e.target;
    dispatch({ type: "SET_SETTING", payload: { name, value: Number(value) } });
  };

  const openModal = (settingKey) => {
    setModalState({
      isOpen: true,
      setting: { key: settingKey, ...settingConfigs[settingKey] },
      tempValue: state[settingKey],
    });
  };

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const handleSliderChange = (e) => {
    setModalState({ ...modalState, tempValue: Number(e.target.value) });
  };

  const handleConfirmSetting = () => {
    dispatch({
      type: "SET_SETTING",
      payload: { name: modalState.setting.key, value: modalState.tempValue },
    });
    closeModal();
  };

  const handleMusicSelect = (videoId) => {
    // <option>의 value는 항상 문자열이므로, "null" 문자열을 실제 null로 변환합니다.
    const newVideoId = videoId === "null" ? null : videoId;
    setSelectedVideoId(newVideoId);

    const selectedMusic = musicPresets.find((m) => m.videoId === newVideoId);
    setSelectedVideoTitle(selectedMusic ? selectedMusic.name : "");
  };

  // 분:초 형식으로 포맷팅하는 함수
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="App">
      <header className={headerClassNames.join(" ")}>
        <h1>BIT TIMER</h1>

        {!isActive && !isFinished ? (
          // 설정 화면 (타이머 비활성 상태)
          <div className="setup-container">
            <div className="settings-stack">
              <div className="setting-display" onClick={() => openModal("sets")}>
                <span className="setting-label">SET</span>
                <span className="setting-value">{sets}</span>
              </div>
              <div
                className="setting-display"
                onClick={() => openModal("workTime")}
              >
                <span className="setting-label">WORK OUT</span>
                <span className="setting-value">{formatTime(workTime)}</span>
              </div>
              <div
                className="setting-display"
                onClick={() => openModal("restTime")}
              >
                <span className="setting-label">REST</span>
                <span className="setting-value">{formatTime(restTime)}</span>
              </div>
            </div>

            <div className="total-time-display">
              <p>Total Workout Time</p>
              <span>{formatTime(totalWorkoutTime)}</span>
            </div>

            <MusicSelector
              musicPresets={musicPresets}
              selectedVideoId={selectedVideoId || "null"}
              onSelect={handleMusicSelect}
            />

            <div className="controls">
              <button className="start-button" onClick={handleStartPause}>
                START
              </button>
            </div>
          </div>
        ) : (
          // 타이머 실행 화면 (타이머 활성 상태)
          <div className="timer-container">
            <div className="timer-display">
              <h2>{isWorking ? "Workout 🏋️‍♀️" : "rest 😌"}</h2>
              <p className="time-text">{formatTime(currentTime)}</p>
              <p className="set-text">
                SET: {currentSet} / {sets}
              </p>
            </div>
            <div className="controls">
              <button onClick={handleStartPause}>
                {isActive ? "Pause" : "Resume"}
              </button>
              {isWorking && isActive && (
                <button onClick={handleSkipToRest}>Rest</button>
              )}
              <button onClick={handleReset}>Reset</button>
            </div>
          </div>
        )}
      </header>
      <YouTubePlayer
        videoId={selectedVideoId}
        videoTitle={selectedVideoTitle}
      />
      <Modal isOpen={modalState.isOpen} onClose={closeModal}>
        {modalState.setting && (
          <>
            <h3 className="modal-title">{modalState.setting.label}</h3>
            <div className="slider-container">
              <span className="slider-value">
                {modalState.setting.key === "sets"
                  ? modalState.tempValue
                  : formatTime(modalState.tempValue)}
              </span>
              <input
                type="range"
                min={modalState.setting.min}
                max={modalState.setting.max}
                step={modalState.setting.step}
                value={modalState.tempValue}
                onChange={handleSliderChange}
                className="slider"
              />
            </div>
            <button className="confirm-button" onClick={handleConfirmSetting}>
              Confirm
            </button>
          </>
        )}
      </Modal>
    </div>
  );
}

export default App;
