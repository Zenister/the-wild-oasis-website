import { updateBooking } from "@/app/_lib/actions";
import { getBooking, getBookings, getCabin } from "@/app/_lib/data-service";
import SubmitButton, {
  ReservationEditButton,
} from "@/app/_components/SubmitButton";
import { auth } from "@/app/_lib/auth";

export default async function Page({ params }) {
  // Prevent other user from accessing other's user booking
  const session = await auth();

  const guestBookings = await getBookings(session.user.guestId);
  const guestBookingsIds = guestBookings.map((booking) => booking.id);

  const reservationId = Number(params.reservationId);
  if (!guestBookingsIds.includes(reservationId))
    throw new Error("You are not allowed to view this booking");

  const { cabinId, numGuests, observations, endDate } = await getBooking(
    reservationId
  );

  // Prevent from accessing old booking
  const newEndDate = new Date(endDate);
  const currentDate = new Date();
  if (currentDate > newEndDate)
    throw new Error("You are not allowed to edit passed booking");

  // get the maxCapacity
  const { maxCapacity } = await getCabin(cabinId);

  return (
    <div>
      <h2 className="font-semibold text-2xl text-accent-400 mb-7">
        Edit Reservation #{reservationId}
      </h2>

      <form
        action={updateBooking}
        className="bg-primary-900 py-8 px-12 text-lg flex gap-6 flex-col"
      >
        <div className="space-y-2">
          <input name="bookingId" defaultValue={reservationId} hidden />
          <label htmlFor="numGuests">How many guests?</label>
          <select
            name="numGuests"
            defaultValue={numGuests}
            id="numGuests"
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
            required
          >
            <option value="" key="">
              Select number of guests...
            </option>
            {Array.from({ length: maxCapacity }, (_, i) => i + 1).map((x) => (
              <option value={x} key={x}>
                {x} {x === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="observations">
            Anything we should know about your stay?
          </label>
          <textarea
            name="observations"
            defaultValue={observations}
            className="px-5 py-3 bg-primary-200 text-primary-800 w-full shadow-sm rounded-sm"
          />
        </div>

        <div className="flex justify-end items-center gap-6">
          <SubmitButton pendingLabel="Updating...">
            Update Reservation
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
