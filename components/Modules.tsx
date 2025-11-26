import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text, Cylinder, Edges, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// --- MATERIALS & COLORS ---
const COLOR_DEFAULT = "#475569"; // Slate 600
const COLOR_ACCENT = "#06b6d4"; // Cyan 500
const COLOR_ACTIVE = "#d946ef"; // Fuchsia 500
const COLOR_SUCCESS = "#22c55e"; // Green 500

// --- SORTING VISUALIZER ---
interface SortingModuleProps {
  data: number[];
  highlights: number[];
  sortedIndices: number[];
}

interface SortingPillarProps {
    val: number;
    idx: number;
    width: number;
    radius: number;
    gap: number;
    startX: number;
    isHighlighted: boolean;
    isSorted: boolean;
}

const SortingPillar: React.FC<SortingPillarProps> = ({ 
    val, 
    idx, 
    width, 
    radius, 
    gap, 
    startX, 
    isHighlighted, 
    isSorted, 
}) => {
    let color = COLOR_DEFAULT;
    let emissiveColor = "#000000";
    let baseEmissiveIntensity = 0;

    if (isHighlighted) {
        color = COLOR_ACTIVE;
        emissiveColor = COLOR_ACTIVE;
        baseEmissiveIntensity = 2.0;
    } else if (isSorted) {
        color = COLOR_SUCCESS;
        emissiveColor = COLOR_SUCCESS;
        baseEmissiveIntensity = 0.5;
    }

    const materialRef = useRef<THREE.MeshStandardMaterial>(null);

    useFrame(({ clock }) => {
        if (isSorted && materialRef.current) {
             const t = clock.getElapsedTime();
             // Pulse between 0.5 and 1.2
             materialRef.current.emissiveIntensity = 0.5 + (Math.sin(t * 3) * 0.35 + 0.35); 
        }
    });

    return (
        <group position={[startX + idx * (width + gap), 0, 0]}>
            <Cylinder
                args={[radius, radius, val, 6]} 
                position={[0, val / 2, 0]}
            >
                <meshStandardMaterial 
                    ref={materialRef}
                    color={color} 
                    emissive={emissiveColor} 
                    emissiveIntensity={baseEmissiveIntensity} 
                    roughness={0.2}
                    metalness={0.7}
                />
                <Edges color={isSorted ? "#86efac" : "#94a3b8"} threshold={15} />
            </Cylinder>
            
            {isSorted && (
                <Sparkles 
                    count={15}
                    scale={[width * 2.5, val, width * 2.5]}
                    position={[0, val / 2, 0]}
                    speed={0.8}
                    opacity={1}
                    color="#4ade80"
                    size={3}
                    noise={0.2}
                />
            )}
            
            <Text
                position={[0, val + 0.8, 0]}
                fontSize={0.6}
                color="#ffffff"
                anchorX="center"
                anchorY="middle"
                outlineWidth={0.04}
                outlineColor="#000000"
            >
                {val}
            </Text>

            <Text
                position={[0, -0.6, 0.5]}
                fontSize={0.35}
                color="#64748b"
                anchorX="center"
                anchorY="middle"
            >
                {idx}
            </Text>
        </group>
    );
};

export const SortingModule: React.FC<SortingModuleProps> = ({ 
    data, 
    highlights, 
    sortedIndices, 
}) => {
  const gap = 0.4;
  const width = 0.8; 
  const radius = width / 1.8; // Hexagon radius
  const totalWidth = data.length * (width + gap);
  const startX = -totalWidth / 2 + width / 2;

  return (
    <group position={[0, -4, 0]}>
      {data.map((val, idx) => (
        <SortingPillar
            key={idx}
            val={val}
            idx={idx}
            width={width}
            radius={radius}
            gap={gap}
            startX={startX}
            isHighlighted={highlights.includes(idx)}
            isSorted={sortedIndices.includes(idx)}
        />
      ))}
      
      {/* Base Platform */}
      <Box args={[totalWidth + 4, 0.2, 6]} position={[0, -0.1, 0]}>
         <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
         <Edges color="#1e293b" />
      </Box>
      <gridHelper args={[totalWidth + 10, 20, 0x1e293b, 0x0f172a]} position={[0, -0.05, 0]} />
    </group>
  );
};