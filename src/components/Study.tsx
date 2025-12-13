import { useEffect, useMemo, useState } from 'react';
import { BookOpen, ChevronRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Subject {
  id: string;
  name: string;
  category: string;
  course: string;
}

interface StudyMaterial {
  id: string;
  title: string;
  content: string;
  subject_id: string;
  uploaded_by: string;
  created_at: string;
}

export function Study() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'BCP' | 'SEC' | 'GE' | 'VAC' | 'AEC'>('ALL');
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [materialsLoading, setMaterialsLoading] = useState(false);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      fetchMaterials(selectedSubject);
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (!error && data) {
        setSubjects(data);
        const uniqueCourses = Array.from(new Set(data.map((s) => s.course))).filter(Boolean) as string[];
        setCourses(uniqueCourses);
        if (!selectedCourse && uniqueCourses.length > 0) {
          setSelectedCourse(uniqueCourses[0]);
        }
        if (data.length > 0) {
          // if a course is already set, prefer the first subject of that course
          const firstForCourse = selectedCourse
            ? data.find((d) => d.course === selectedCourse)
            : data[0];
          setSelectedSubject(firstForCourse?.id ?? data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!selectedCourse && courses.length > 0) {
      setSelectedCourse(courses[0]);
    }
  }, [courses, selectedCourse]);

  useEffect(() => {
    if (selectedCourse) {
      const forCourse = subjects.filter((s) => s.course === selectedCourse);
      if (forCourse.length > 0) {
        setSelectedSubject((prev) => {
          // if previous subject belongs to the same course keep it, otherwise switch to first
          const stillValid = prev && forCourse.some((f) => f.id === prev);
          return stillValid ? prev : forCourse[0].id;
        });
      } else {
        setSelectedSubject(null);
      }
    }
  }, [selectedCourse, subjects]);

  const fetchMaterials = async (subjectId: string) => {
    setMaterialsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('subject_id', subjectId)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setMaterials(data);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
    }
    setMaterialsLoading(false);
  };

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const matchesCourse = selectedCourse ? subject.course === selectedCourse : true;
      const matchesCategory = selectedCategory === 'ALL' ? true : subject.category === selectedCategory;
      return matchesCourse && matchesCategory;
    });
  }, [selectedCategory, selectedCourse, subjects]);

  // Keep the selected subject in sync when filters change
  useEffect(() => {
    if (filteredSubjects.length === 0) {
      setSelectedSubject(null);
      return;
    }
    const stillValid = selectedSubject && filteredSubjects.some((s) => s.id === selectedSubject);
    if (!stillValid) {
      setSelectedSubject(filteredSubjects[0].id);
    }
  }, [filteredSubjects, selectedSubject]);

  const categoryTabs: { key: typeof selectedCategory; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'BCP', label: 'Core' },
    { key: 'SEC', label: 'SEC' },
    { key: 'GE', label: 'GE' },
    { key: 'AEC', label: 'AEC' },
    { key: 'VAC', label: 'VAC' },
  ];

  const selectedSubjectData = subjects.find((s) => s.id === selectedSubject);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <header className="rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-50 to-white p-6 shadow-lg shadow-gray-100">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-blue-600 font-semibold">Nerd Mode</p>
              <h1 className="text-3xl font-extrabold text-gray-900">Find your subject</h1>
              <p className="text-gray-600 text-sm mt-1">
                Pick a course, filter by category, and open the materials you need.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm text-blue-600 border border-blue-200">
              <BookOpen className="w-4 h-4" />
              <span>{subjects.length} subjects</span>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Choose your course</h2>
            {loading && (
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {courses.map((course) => {
              const active = selectedCourse === course;
              return (
                <button
                  key={course}
                  onClick={() => setSelectedCourse(course)}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {course}
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categoryTabs.map((tab) => {
              const active = selectedCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedCategory(tab.key)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </section>

        <section className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-md p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <h3 className="text-base font-semibold text-gray-900">Subjects</h3>
                </div>
                <span className="text-xs text-gray-600">
                  {filteredSubjects.length} shown
                </span>
              </div>

              {loading ? (
                <div className="space-y-2">
                  {[...Array(6)].map((_, idx) => (
                    <div key={idx} className="h-12 rounded-xl bg-gray-200 animate-pulse"></div>
                  ))}
                </div>
              ) : filteredSubjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center text-gray-500">
                  <BookOpen className="w-10 h-10 text-gray-300 mb-3" />
                  <p>No subjects found for this filter.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-2">
                  {filteredSubjects.map((subject) => {
                    const active = selectedSubject === subject.id;
                    return (
                      <button
                        key={subject.id}
                        onClick={() => setSelectedSubject(subject.id)}
                        className={`w-full rounded-xl border px-4 py-3 text-left transition shadow-sm flex items-center justify-between ${
                          active
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                            : 'border-gray-300 bg-white text-gray-900 hover:border-blue-300'
                        }`}
                      >
                        <span className="font-semibold text-sm leading-snug">{subject.name}</span>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform ${
                            active ? 'translate-x-1' : ''
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                <p className="text-xs uppercase tracking-wide text-gray-600">Selected subject</p>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">
                  {selectedSubjectData?.name ?? 'Choose a subject'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedSubjectData?.course ?? 'Start by selecting a course and subject'}
                </p>
              </div>

              <div className="p-6">
                {materialsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-28 bg-gray-200 rounded-xl animate-pulse"></div>
                    ))}
                  </div>
                ) : materials.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No study materials available for this subject yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {materials.map((material) => (
                      <div
                        key={material.id}
                        className="border border-gray-200 rounded-xl p-4 bg-white hover:border-gray-300 hover:shadow-sm transition"
                      >
                        <h4 className="font-semibold text-gray-900 mb-2">
                          {material.title}
                        </h4>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                          {material.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600">
                            {new Date(material.created_at).toLocaleDateString()}
                          </p>
                          <button className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition">
                            View
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
