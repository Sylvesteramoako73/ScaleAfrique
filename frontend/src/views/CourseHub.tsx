'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, ArrowLeft, Trash2, BookOpen, Users, Eye, EyeOff } from 'lucide-react';
import { clsx } from 'clsx';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { Modal } from '../components/ui/Modal';
import { coursesService, Course, Lesson } from '../services/courses.service';

const CATEGORIES = ['Business', 'Tech', 'Marketing', 'Design', 'Finance', 'Health', 'Other'];

export function CourseHub() {
  const qc = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', price: '', category: 'Business' });
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', videoUrl: '', duration: '' });

  const { data: courses = [], isLoading } = useQuery<Course[]>({ queryKey: ['courses'], queryFn: coursesService.list });

  const { data: courseDetail, isLoading: detailLoading } = useQuery<Course>({
    queryKey: ['course', selectedCourse?.id],
    queryFn: () => coursesService.get(selectedCourse!.id),
    enabled: !!selectedCourse,
  });

  const createCourse = useMutation({
    mutationFn: () => coursesService.create({ title: courseForm.title, description: courseForm.description, price: parseFloat(courseForm.price) || 0, category: courseForm.category }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['courses'] });
      setShowNewCourse(false);
      setCourseForm({ title: '', description: '', price: '', category: 'Business' });
      toast.success('Course created');
    },
    onError: () => toast.error('Failed to create course'),
  });

  const togglePublish = useMutation({
    mutationFn: (course: Course) => coursesService.update(course.id, { isPublished: !course.isPublished }),
    onSuccess: (_, course) => {
      qc.invalidateQueries({ queryKey: ['courses'] });
      qc.invalidateQueries({ queryKey: ['course', course.id] });
      if (selectedCourse) setSelectedCourse((c) => c ? { ...c, isPublished: !c.isPublished } : null);
    },
  });

  const addLesson = useMutation({
    mutationFn: () => coursesService.addLesson(selectedCourse!.id, {
      title: lessonForm.title,
      content: lessonForm.content,
      videoUrl: lessonForm.videoUrl || undefined,
      duration: parseInt(lessonForm.duration) || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course', selectedCourse?.id] });
      setShowAddLesson(false);
      setLessonForm({ title: '', content: '', videoUrl: '', duration: '' });
      toast.success('Lesson added');
    },
    onError: () => toast.error('Failed to add lesson'),
  });

  const deleteLesson = useMutation({
    mutationFn: ({ courseId, lessonId }: { courseId: string; lessonId: string }) => coursesService.deleteLesson(courseId, lessonId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['course', selectedCourse?.id] });
      toast.success('Lesson deleted');
    },
  });

  if (selectedCourse) {
    const course = courseDetail ?? selectedCourse;
    const lessons = course.lessons ?? [];
    return (
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <button onClick={() => setSelectedCourse(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft size={16} /> Back to Courses
        </button>

        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={clsx('px-2 py-0.5 rounded text-xs font-semibold', course.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
                {course.category && <span className="text-xs text-gray-400">{course.category}</span>}
              </div>
              <h2 className="text-xl font-bold text-gray-900">{course.title}</h2>
              {course.description && <p className="text-sm text-gray-600 mt-1">{course.description}</p>}
              <p className="text-sm font-semibold text-gray-700 mt-2">{course.price === 0 ? 'Free' : `$${course.price}`}</p>
            </div>
            <Button
              variant={course.isPublished ? 'outline' : 'primary'}
              size="sm"
              icon={course.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
              onClick={() => togglePublish.mutate(course)}
              loading={togglePublish.isPending}
            >
              {course.isPublished ? 'Unpublish' : 'Publish'}
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lessons ({lessons.length})</CardTitle>
            <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowAddLesson(true)}>Add Lesson</Button>
          </CardHeader>
          {detailLoading ? (
            <div className="flex justify-center py-4"><Spinner /></div>
          ) : lessons.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">No lessons yet.</p>
          ) : (
            <div className="space-y-3">
              {[...lessons].sort((a, b) => a.order - b.order).map((lesson, i) => (
                <div key={lesson.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                        <p className="font-semibold text-gray-900">{lesson.title}</p>
                        {lesson.duration && <span className="text-xs text-gray-400">{lesson.duration} min</span>}
                      </div>
                      {lesson.content && <p className="text-sm text-gray-500 ml-8 line-clamp-2">{lesson.content}</p>}
                      {lesson.videoUrl && <p className="text-xs text-blue-500 ml-8 mt-1 truncate">{lesson.videoUrl}</p>}
                    </div>
                    <button onClick={() => { if (confirm('Delete lesson?')) deleteLesson.mutate({ courseId: selectedCourse.id, lessonId: lesson.id }); }} className="text-gray-300 hover:text-red-500 p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Modal open={showAddLesson} onClose={() => setShowAddLesson(false)} title="Add Lesson" footer={
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowAddLesson(false)}>Cancel</Button>
            <Button loading={addLesson.isPending} disabled={!lessonForm.title} onClick={() => addLesson.mutate()}>Add Lesson</Button>
          </div>
        }>
          <div className="space-y-3">
            <Input label="Title" value={lessonForm.title} onChange={(e) => setLessonForm((f) => ({ ...f, title: e.target.value }))} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
              <textarea className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" rows={4} value={lessonForm.content} onChange={(e) => setLessonForm((f) => ({ ...f, content: e.target.value }))} />
            </div>
            <Input label="Video URL" value={lessonForm.videoUrl} onChange={(e) => setLessonForm((f) => ({ ...f, videoUrl: e.target.value }))} placeholder="https://..." />
            <Input label="Duration (minutes)" type="number" value={lessonForm.duration} onChange={(e) => setLessonForm((f) => ({ ...f, duration: e.target.value }))} />
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Hub</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage your online courses</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={() => setShowNewCourse(true)}>New Course</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Spinner /></div>
      ) : courses.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
          <p>No courses yet. Create your first course!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div key={course.id} className="cursor-pointer" onClick={() => setSelectedCourse(course)}><Card>
              <div className="flex items-start justify-between mb-3">
                <span className={clsx('px-2 py-0.5 rounded text-xs font-semibold', course.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500')}>
                  {course.isPublished ? 'Published' : 'Draft'}
                </span>
                {course.category && <span className="text-xs text-gray-400">{course.category}</span>}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
              {course.description && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{course.description}</p>}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                <p className="text-sm font-bold text-primary-600">{course.price === 0 ? 'Free' : `$${course.price}`}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><BookOpen size={12} />{course._count?.lessons ?? 0}</span>
                  <span className="flex items-center gap-1"><Users size={12} />{course._count?.enrollments ?? 0}</span>
                </div>
              </div>
            </Card></div>
          ))}
        </div>
      )}

      <Modal open={showNewCourse} onClose={() => setShowNewCourse(false)} title="New Course" footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setShowNewCourse(false)}>Cancel</Button>
          <Button loading={createCourse.isPending} disabled={!courseForm.title} onClick={() => createCourse.mutate()}>Create Course</Button>
        </div>
      }>
        <div className="space-y-3">
          <Input label="Title" value={courseForm.title} onChange={(e) => setCourseForm((f) => ({ ...f, title: e.target.value }))} />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none" rows={3} value={courseForm.description} onChange={(e) => setCourseForm((f) => ({ ...f, description: e.target.value }))} />
          </div>
          <Input label="Price ($)" type="number" value={courseForm.price} onChange={(e) => setCourseForm((f) => ({ ...f, price: e.target.value }))} placeholder="0 for free" />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" value={courseForm.category} onChange={(e) => setCourseForm((f) => ({ ...f, category: e.target.value }))}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}
