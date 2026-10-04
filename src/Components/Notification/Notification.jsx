import { useContext, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { IoNotificationsOutline } from 'react-icons/io5'
import { Slide, toast } from 'react-toastify'
import { TokenContext } from '../../Context/TokenContext'
import { getNotifications } from '../../Api/GetNotifications.api'
import { getUnreadNotificationsCount } from '../../Api/GetUnreadNotificationsCount.api'
import { markAllNotificationsRead } from '../../Api/MarkAllNotificationsRead.api'
import { markNotificationRead } from '../../Api/MarkNotificationRead.api'

dayjs.extend(relativeTime)

function describeNotification(notification) {
    switch (notification?.type) {
        case 'like_post':
            return 'liked your post'
        case 'comment_post':
            return 'commented on your post'
        case 'share_post':
            return 'shared your post'
        case 'follow_user':
            return 'started following you'
        case 'like_comment':
            return 'liked your comment'
        case 'reply_comment':
            return 'replied to your comment'
        default:
            return 'interacted with your content'
    }
}

function getNotificationTarget(notification) {
    const { entityType, entityId } = notification || {}
    if (entityType === 'user' && entityId) {
        return `/profile/${entityId}`
    }
    if (entityType === 'post' && entityId) {
        return `/postDetails/${entityId}`
    }
    return '/home'
}

export default function NotificationBell() {
    const { userToken } = useContext(TokenContext)
    const [isOpen, setIsOpen] = useState(false)
    const panelRef = useRef(null)
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const { data: notifications, isLoading } = useQuery({
        queryKey: ['GetNotifications'],
        queryFn: () => getNotifications(),
        select: (res) => res?.data?.data?.notifications || [],
        enabled: !!userToken,
    })

    const { data: unreadCount } = useQuery({
        queryKey: ['GetUnreadNotificationsCount'],
        queryFn: () => getUnreadNotificationsCount(),
        select: (res) => res?.data?.data?.unreadCount ?? 0,
        enabled: !!userToken,
    })

    const { mutate: markReadMutate } = useMutation({
        mutationFn: ({ notificationId }) => markNotificationRead({ notificationId }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['GetNotifications'] })
            queryClient.invalidateQueries({ queryKey: ['GetUnreadNotificationsCount'] })
        }
    })

    const { mutate: markAllReadMutate } = useMutation({
        mutationFn: () => markAllNotificationsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['GetNotifications'] })
            queryClient.invalidateQueries({ queryKey: ['GetUnreadNotificationsCount'] })
        }
    })

    useEffect(() => {
        function handleClickOutside(event) {
            if (panelRef.current && !panelRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('pointerdown', handleClickOutside)
        return () => document.removeEventListener('pointerdown', handleClickOutside)
    }, [])

    function handleNotificationClick(notification) {
        const notificationId = notification?._id || notification?.id
        if (!notification?.isRead && notificationId) {
            markReadMutate({ notificationId })
        }
        setIsOpen(false)

        if (notification?.entity?.unavailable) {
            toast.info('This content is no longer available', {
                position: "top-right",
                autoClose: 1500,
                hideProgressBar: true,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                theme: "colored",
                transition: Slide,
            })
            return
        }

        navigate(getNotificationTarget(notification))
    }

    if (!userToken) return null

    const hasUnread = notifications?.some((n) => !n.isRead)

    return (
        <div ref={panelRef} className="relative">
            <button
                onClick={() => setIsOpen((prev) => !prev)}
                className="relative p-2.5 text-black hover:bg-black/10 dark:hover:bg-white/10 rounded-full transition cursor-pointer flex items-center justify-center"
                aria-label="Notifications"
            >
                <IoNotificationsOutline className="text-xl" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="fixed sm:absolute top-16 sm:top-auto right-4 sm:right-0 left-4 sm:left-auto mt-2 w-auto sm:w-96 bg-[#FAF9F9] dark:bg-[#060607] text-[#060607] dark:text-[#FAF9F9] rounded-2xl p-3 shadow-2xl border border-gray-200 dark:border-gray-800 z-50">
                    <div className="flex items-center justify-between px-1 pb-2">
                        <h3 className="font-semibold text-sm">Notifications</h3>
                        {hasUnread && (
                            <button
                                onClick={() => markAllReadMutate()}
                                className="text-xs text-blue-600 hover:underline cursor-pointer"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto flex flex-col gap-1">
                        {isLoading ? (
                            <p className="text-xs text-center py-6 text-gray-500">Loading...</p>
                        ) : notifications?.length > 0 ? (
                            notifications.map((notification) => {
                                const notificationId = notification?._id || notification?.id
                                const actor = notification?.actor

                                return (
                                    <div
                                        key={notificationId}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`flex items-start gap-3 p-2.5 rounded-xl transition cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/60 ${!notification?.isRead ? 'bg-gray-100 dark:bg-gray-800/40' : ''
                                            }`}
                                    >
                                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-blue-600">
                                            {actor?.photo && (
                                                <img src={actor.photo} alt={actor?.name} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex flex-col overflow-hidden flex-1">
                                            <p className="text-sm leading-snug">
                                                <span className="font-semibold">{actor?.name || 'Someone'}</span>{' '}
                                                {describeNotification(notification)}
                                            </p>
                                            <span className="text-xs text-gray-400 mt-0.5">
                                                {notification?.createdAt ? dayjs(notification.createdAt).fromNow() : ''}
                                            </span>
                                        </div>
                                        {!notification?.isRead && (
                                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />
                                        )}
                                    </div>
                                )
                            })
                        ) : (
                            <p className="text-xs text-center py-6 text-gray-500">No notifications yet</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}