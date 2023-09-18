import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader';
import GameOverScreen from './GameOverScreen';

import './GameBoard.css';

export const Gameboard = () => {
  const sceneRef = useRef(null);
  const [jumping, setJumping] = useState(false);
  let [jumpHeight] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameRunning, setGameRunning] = useState(true);
  const [score, setScore] = useState(0);



  // Создайте массив для хранения препятствий
  const obstacles = [];
  const obstacleDirection = new THREE.Vector3(-1, 0, 1); // Вперед по z-оси (направление к персонажу)


  useEffect(() => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer();

    const checkCollision = (character, obstacle) => {
      const characterBox = new THREE.Box3().setFromObject(character);
      const obstacleBox = new THREE.Box3().setFromObject(obstacle);
      return characterBox.intersectsBox(obstacleBox);
    };

    
    

    renderer.setSize(window.innerWidth, window.innerHeight);
    sceneRef.current.appendChild(renderer.domElement);

    scene.background = new THREE.Color(0x00beec);
    camera.position.z = 5;

    const groundGeometry = new THREE.PlaneGeometry(50, 15, 10, 10);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    scene.add(ground);

    const pointLight = new THREE.PointLight('red', 10);
    pointLight.position.set(-1, 2, 4);
    scene.add(pointLight);

    const loader = new GLTFLoader();

    loader.load('./character.glb', (gltf) => {
      const character = gltf.scene;
      character.position.set(-2, -1, 4);

      character.rotation.y = 98;
      scene.add(character);

      character.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({ color: 0xffffff });
        }
      });

      let lastObstacleTime = 0;

      // Функция для создания препятствия
      const createObstacle = () => {
        loader.load('./bomb.glb', (gltfObstacle) => {
          const obstacleModel = gltfObstacle.scene;
      
          // Уменьшение модели в 2 раза по всем осям
          obstacleModel.scale.set(0.05, 0.05, 0.05);
      
          // Опускание модели на 2 единицы по оси Y
          obstacleModel.position.x = 6; // Случайная позиция по x
          obstacleModel.position.y = -0.7; // На уровне земли
          obstacleModel.position.z = -4;

          obstacleModel.rotation.y = 150

          setScore((prev) => prev + 10)
      
          scene.add(obstacleModel);
          obstacles.push(obstacleModel);

          obstacleModel.traverse((child) => {
            if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({ color: 'black' });
            }
          });
        });
      };
      
      

      // Функция для движения препятствий
      const moveObstacles = () => {
        if (gameOver) {
          setGameRunning(false); // Остановить игру при проигрыше
          return;
        }
      
        const obstacleSpeed = 0.03;
      
        for (let i = 0; i < obstacles.length; i++) {
          const obstacle = obstacles[i];
          const obstaclePosition = obstacle.position.clone();
          obstaclePosition.add(obstacleDirection.clone().multiplyScalar(obstacleSpeed));
          obstacle.position.copy(obstaclePosition);
      
          // Если препятствие выходит за пределы вашего взгляда, удалите его
          if (obstacle.position.z < -10) {
            scene.remove(obstacle);
            obstacles.splice(i, 1);
            i--;
          } else {
            // Проверяем столкновение с персонажем
            if (checkCollision(character, obstacle)) {
              setGameOver(true); // Игра заканчивается при столкновении
              return;
            }
          }
        }
      
        const obstacleInterval = 1000;
      
        if (performance.now() - lastObstacleTime > obstacleInterval) {
          createObstacle();
          lastObstacleTime = performance.now();
        }
      
        requestAnimationFrame(moveObstacles);
      };

      moveObstacles();

      // Обработка клавиши пробела для прыжка (доступно только если игра не завершена)
      window.addEventListener('keydown', (e) => {
        if (e.key === ' ' && !gameOver) {
          if (!jumping) {
            setJumping(true);
            jump();
          }
        }
      });

      const jump = () => {
        if (jumpHeight < 2) {
          jumpHeight += 0.05;
          character.position.y += 0.03;
          requestAnimationFrame(jump);
        } else {
          fall();
        }
      };

      const fall = () => {
        if (jumpHeight > 0) {
          jumpHeight -= 0.05;
          character.position.y -= 0.03;
          requestAnimationFrame(fall);
        } else {
          setJumping(false);
        }
      };
    });

    const animate = () => {
      if (gameRunning) {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      }
    };

    animate();
  }, [gameOver]);


  return (
    <div className="game-container">
      <div className="score">Score: {score}</div>
      <div ref={sceneRef} />
      {gameOver && (
        <div>
          <GameOverScreen score={score} />
        </div>
      )}
    </div>
  );
};
