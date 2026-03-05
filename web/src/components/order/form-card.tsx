"use client";

interface Props {
  formik: any;
}

export default function GuestForm({ formik }: Props) {
  return (
    <div className="flex flex-col border border-gray-200 w-[450px] gap-y-4 py-4 px-2">
      <h2 className="text-xl text-black">Insert Your Detail</h2>

      <div className="flex flex-col gap-y-4">
        {/* First Name */}
        <div className="flex flex-col gap-y-1">
          <label className="text-sm text-black tracking-wide">First Name</label>
          <input
            name="firstName"
            type="text"
            value={formik.values.firstName}
            onChange={formik.handleChange}
            className="border border-gray-400 w-[430px] h-10 rounded-md px-3"
          />
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-y-1">
          <label className="text-sm text-black tracking-wide">Last Name</label>
          <input
            name="lastName"
            type="text"
            value={formik.values.lastName}
            onChange={formik.handleChange}
            className="border border-gray-400 w-[430px] h-10 rounded-md px-3"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-y-1">
          <label className="text-sm text-black tracking-wide">
            Email Address
          </label>
          <input
            name="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            className="border border-gray-400 w-[430px] h-10 rounded-md px-3"
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-y-1">
          <label className="text-sm text-black tracking-wide">
            Phone Number
          </label>
          <input
            name="phoneNumber"
            type="text"
            value={formik.values.phoneNumber}
            onChange={formik.handleChange}
            className="border border-gray-400 w-[430px] h-10 rounded-md px-3"
          />
        </div>
      </div>

      <div className="border-t border-gray-200 mt-2"></div>

      <div className="flex flex-col gap-y-6">
        {/* Question 1 */}
        <div className="flex flex-col gap-y-2">
          <h3 className="text-sm text-black tracking-wide">
            Who are you ordering for?{" "}
            <span className="text-gray-400">(optional)</span>
          </h3>

          <div className="flex flex-col gap-y-1 text-sm">
            <label className="flex items-center gap-x-2 cursor-pointer">
              <input
                type="radio"
                name="orderFor"
                className="w-3 h-3 text-sky-600"
              />
              <span className="text-black">I'm the guest</span>
            </label>

            <label className="flex items-center gap-x-2 cursor-pointer">
              <input
                type="radio"
                name="orderFor"
                className="w-3 h-3 text-sky-600"
              />
              <span className="text-black">This order is for other person</span>
            </label>
          </div>
        </div>

        {/* Question 2 */}
        <div className="flex flex-col gap-y-2">
          <h3 className="text-sm text-black tracking-wide">
            Going for work? <span className="text-gray-400">(optional)</span>
          </h3>

          <div className="flex flex-col gap-y-1 text-sm">
            <label className="flex items-center gap-x-2 cursor-pointer">
              <input
                type="radio"
                name="goingFor"
                className="w-3 h-3 text-sky-600"
              />
              <span className="text-black">Yes</span>
            </label>

            <label className="flex items-center gap-x-2 cursor-pointer">
              <input
                type="radio"
                name="goingFor"
                className="w-3 h-3 text-sky-600"
              />
              <span className="text-black">No</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
