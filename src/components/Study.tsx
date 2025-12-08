import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { BookOpen, ChevronRight } from 'lucide-react';

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
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
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
        if (data.length > 0) {
          setSelectedSubject(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
    setLoading(false);
  };

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

  const groupedSubjects = subjects.reduce(
    (acc, subject) => {
      if (!acc[subject.category]) {
        acc[subject.category] = [];
      }
      acc[subject.category].push(subject);
      return acc;
    },
    {} as Record<string, Subject[]>
  );

  const categoryLabels: Record<string, string> = {
    BCP: 'Core Subjects',
    SEC: 'Specialization',
    GE: 'General Education',
    AEC: 'Ability Enhancement',
    VAC: 'Value Added',
  };

  const selectedSubjectData = subjects.find((s) => s.id === selectedSubject);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden sticky top-24">
            <div className="p-4 border-b border-gray-200 bg-white/50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-du" />
                <span>Subjects</span>
              </h2>
            </div>

            <div className="max-h-[calc(100vh-10rem)] overflow-y-auto">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-12 bg-gray-200 rounded-lg animate-pulse"
                    ></div>
                  ))}
                </div>
              ) : (
                <div className="p-4 space-y-6">
                  {Object.entries(groupedSubjects).map(([category, cats]) => (
                    <div key={category}>
                      <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                        {categoryLabels[category] || category}
                      </h3>
                      <div className="space-y-2">
                        {cats.map((subject) => (
                          <button
                            key={subject.id}
                            onClick={() => setSelectedSubject(subject.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center justify-between group ${
                              selectedSubject === subject.id
                                ? 'bg-du text-white'
                                : 'text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <span className="font-medium text-sm truncate">
                              {subject.name}
                            </span>
                            <ChevronRight
                              className={`w-4 h-4 transition-transform ${
                                selectedSubject === subject.id ? 'translate-x-1 text-white' : 'text-gray-400'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedSubjectData?.name}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {selectedSubjectData?.course}
              </p>
            </div>

            <div className="p-6">
              {materialsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
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
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition"
                    >
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {material.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-3 mb-3">
                        {material.content}
                      </p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {new Date(material.created_at).toLocaleDateString()}
                        </p>
                        <button className="px-3 py-1 text-sm bg-du/10 text-du rounded-lg hover:bg-du/20 transition font-medium">
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
      </div>
    </div>
  );
}
