import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const taskApi = createApi({
  reducerPath: 'taskApi',

  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include',

    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.accessToken
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),

  tagTypes: ['Task'],

  endpoints: (builder) => ({
    getTasks: builder.query({
      query: () => '/tasks',
      transformResponse: (response) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Task', id: _id })),
              { type: 'Task', id: 'LIST' },
            ]
          : [{ type: 'Task', id: 'LIST' }],
    }),

    createTask: builder.mutation({
      query: (body) => ({
        url: '/tasks',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
    }),

    updateTask: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/tasks/${id}`,
        method: 'PUT',
        body,
      }),
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          taskApi.util.updateQueryData('getTasks', undefined, (draft) => {
            const task = draft.find((t) => t._id === id)
            if (task) Object.assign(task, patch)
          })
        )
        try {
          await queryFulfilled  
        } catch {
          patchResult.undo()    
        }
      },
      invalidatesTags: ({ id } = {}) => [{ type: 'Task', id }],
    }),

    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          taskApi.util.updateQueryData('getTasks', undefined, (draft) => {
            const idx = draft.findIndex((t) => t._id === id)
            if (idx !== -1) draft.splice(idx, 1)
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
      invalidatesTags: (id) => [{ type: 'Task', id }],
    }),
  }),
})

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskApi