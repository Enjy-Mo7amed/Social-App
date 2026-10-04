import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import { Link } from 'react-router-dom'
import { AiFillLike } from 'react-icons/ai'
import { FaRegComment } from 'react-icons/fa'
import { RiShareForwardLine } from 'react-icons/ri'

dayjs.extend(relativeTime)

export default function SharedPostEmbed({ original }) {
    if (!original) {
        return (
            <div className="mx-3 mb-3 border border-[#060607]/10 dark:border-[#FAF9F9]/15 rounded-xl p-4 text-sm text-black/50 dark:text-[#FAF9F9]/50 bg-[#060607]/3 dark:bg-[#FAF9F9]/3">
                This content isn't available at the moment.
            </div>
        )
    }

    const postId = original?._id || original?.id
    const userId = original?.user?._id || original?.user?.id

    return (
        <div className="mx-3 mb-3 border border-[#060607]/10 dark:border-[#FAF9F9]/15 rounded-xl bg-[#060607]/3 dark:bg-[#FAF9F9]/3 overflow-hidden">
            {/* header of original post */}
            <div className="flex items-center gap-3 p-3 pb-2">
                <Link to={`/profile/${userId}`}>
                    <div className="w-9 h-9">
                        <img
                            className="rounded-full w-full h-full object-cover"
                            src={original?.user?.photo}
                            alt={original?.user?.name}
                        />
                    </div>
                </Link>
                <div>
                    <Link to={`/profile/${userId}`}>
                        <h3 className="font-medium text-sm text-black dark:text-[#FAF9F9]">
                            {original?.user?.name}
                        </h3>
                    </Link>
                    <span className="text-xs text-black/50 dark:text-[#FAF9F9]/60">
                        {dayjs(original?.createdAt).fromNow()}
                    </span>
                </div>
            </div>

            {/* body + image of original post */}
            <Link to={`/PostDetails/${postId}`} className="block">
                {original?.body && (
                    <p className="px-3 pb-2 text-sm text-black dark:text-[#FAF9F9]">
                        {original.body}
                    </p>
                )}
                {original?.image && (
                    <div className="w-full max-h-96 overflow-hidden">
                        <img
                            className="w-full object-cover"
                            src={original.image}
                            alt={original.body || 'shared post'}
                        />
                    </div>
                )}
            </Link>
        </div>
    )
}