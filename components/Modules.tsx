
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box, Text, Cylinder, Edges, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// --- MATERIALS & COLORS ---
// MYSTIC CRYSTAL THEME
const COLOR_DEFAULT = "#e2e8f0"; // Silver/White - High visibility
const COLOR_ACCENT = "#2dd4bf"; // Teal
const COLOR_ACTIVE = "#f43f5e"; // Rose 500
const COLOR_SUCCESS = "#34d399"; // Emerald 400

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

    // Solid Glass Look
    const opacity = 0.9;

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
             // Gentle pulse
             materialRef.current.emissiveIntensity = 0.5 + (Math.sin(t * 3) * 0.35 + 0.35); 
        }
    });

    return (
        <group position={[startX + idx * (width + gap), 0, 0]}>
            <Cylinder
                args={[radius, radius, val, 32]} 
                position={[0, val / 2, 0]}
            >
                <meshStandardMaterial 
                    ref={materialRef}
                    color={color} 
                    emissive={emissiveColor} 
                    emissiveIntensity={baseEmissiveIntensity} 
                    roughness={0.1}
                    metalness={0.8}
                    transparent={true}
                    opacity={opacity}
                />
                {/* Darker edges for silver pillars, Lighter for colored ones */}
                <Edges 
                    color={isHighlighted ? "#fda4af" : isSorted ? "#6ee7b7" : "#94a3b8"} 
                    threshold={15} 
                />
            </Cylinder>
            
            {isSorted && (
                <Sparkles 
                    count={15}
                    scale={[width * 2.5, val, width * 2.5]}
                    position={[0, val / 2, 0]}
                    speed={0.8}
                    opacity={1}
                    color="#6ee7b7"
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
                color="#94a3b8"
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
  const radius = width / 1.8; 
  const totalWidth = data.length * (width + gap);
  const startX = -totalWidth / 2 + width / 2;

  // Platform Size
  const platWidth = Math.max(totalWidth + 4, 15);
  const platDepth = 8;

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
      
      {/* Base Platform Group - Dark Slate to let pillars pop */}
      <group position={[0, -0.25, 0]}>
          <Box args={[platWidth, 0.5, platDepth]}>
             <meshStandardMaterial 
                color="#0f172a" 
                metalness={0.5} 
                roughness={0.4} 
             />
             <Edges color="#334155" threshold={15} />
          </Box>
      </group>
      
      {/* Global Floor Grid */}
      <gridHelper 
        args={[100, 40, 0x334155, 0x1e293b]} 
        position={[0, -0.5, 0]} 
      />
    </group>
  );
};
