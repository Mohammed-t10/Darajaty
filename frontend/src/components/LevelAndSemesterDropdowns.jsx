import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from 'lucide-react';
import { levels, semesters, level as initialLevel, semester as initialSemester } from '../utils/getAcademicInfo';

function LevelAndSemesterDropdowns({ sendData, loading }) {
  
  const [level, setLevel] = useState(initialLevel);
  const [semester, setSemester] = useState(initialSemester);

  useEffect(() => {
        sendData(level, semester);
    }, [level, semester, sendData]);

    return (
      <>
        { !loading && 
    <div className="flex justify-end mb-6 flex-wrap gap-2 select-none">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-48">
            الترم الدراسي: {semester} <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {semesters.map((s) => (
            <DropdownMenuItem key={s} onSelect={() => setSemester(s)}>
              <div className="ml-auto">{s}</div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-40">
            المستوى: {level} <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {levels.map((l) => (
            <DropdownMenuItem key={l} onSelect={() => setLevel(l)}>
              <div className="ml-auto">{l}</div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
        }
        </>
  );
}

export { LevelAndSemesterDropdowns, initialLevel, initialSemester, levels, semesters };